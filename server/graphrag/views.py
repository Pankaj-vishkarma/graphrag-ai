import time
from graphrag.models import Evaluation
from graphrag.services.hybrid_retriever import hybrid_search

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from pypdf import PdfReader
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

from graphrag.models import Document, Query
from graphrag.services.rag_chain import generate_answer
from graphrag.services.entity_extractor import extract_entities
from graphrag.services.relationship_extractor import extract_relationships
from graphrag.services.graph_builder import build_graph
from graphrag.services.vector_retriever import add_documents, search
from graphrag.services.graph_retriever import (
    get_all_nodes,
    get_all_relationships,
    find_entity_neighbors,
)
from graphrag.services.hybrid_retriever import hybrid_search, extract_main_entity
from graphrag.services.multihop_reasoner import find_multihop_paths
from graphrag.services.neo4j_client import neo4j_client
from graphrag.services.community_detector import detect_communities


@api_view(["POST"])
def register(request):
    try:
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username & password required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=400)

        user = User.objects.create_user(username=username, password=password)

        return Response({"message": "User registered successfully"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# 1. HYBRID QUERY API
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def query_view(request):
    try:
        query_text = request.data.get("query")

        if not query_text:
            return Response({"error": "Query is required"}, status=400)

        start_time = time.time()

        # 🔹 Hybrid retrieval (graph + vector)
        results = hybrid_search(query_text)

        graph_results = results.get("graph_results", [])
        vector_results = results.get("vector_results", [])

        # =========================
        # 🔥 FIX: BUILD CLEAN CONTEXT
        # =========================
        context_parts = []

        # Graph context → natural readable text
        for item in graph_results:
            if isinstance(item, dict):
                source = item.get("source")
                relation = item.get("relation")
                target = item.get("target")

                if source and relation and target:
                    context_parts.append(f"{source} {relation} {target}")
                else:
                    context_parts.append(str(item))
            else:
                context_parts.append(str(item))

        # Vector context → extract only useful text
        for item in vector_results:
            if isinstance(item, dict):
                text = item.get("text")
                if text:
                    context_parts.append(text)
                else:
                    context_parts.append(str(item))
            elif isinstance(item, tuple):
                context_parts.append(item[0])
            else:
                context_parts.append(str(item))

        context = "\n".join(context_parts)

        print("🔍 GRAPH RESULT:", graph_results)
        print("🔍 VECTOR RESULT:", vector_results)
        print("🧠 FINAL CONTEXT:", context)

        # 🔹 Hybrid answer (LangChain RAG)
        hybrid_answer = generate_answer(query_text)

        # 🔥 Safety fallback
        if not hybrid_answer or str(hybrid_answer).strip() == "":
            hybrid_answer = "No relevant answer found based on available data."

        response_time = time.time() - start_time

        # 🔹 Save query
        query_obj = Query.objects.create(
            user=request.user,
            query_text=query_text,
            graph_answer=str(graph_results),
            vector_answer=str(vector_results),
            hybrid_answer=str(hybrid_answer),
            response_time=response_time,
        )

        # 🔹 Calculate scores
        graph_score, vector_score, hybrid_score = calculate_scores(
            query_text, graph_results, vector_results, hybrid_answer
        )

        # 🔹 Decide best method
        scores = {
            "graph": graph_score,
            "vector": vector_score,
            "hybrid": hybrid_score,
        }

        best_method = max(scores, key=scores.get)

        # 🔹 Save evaluation
        Evaluation.objects.create(
            query=query_obj,
            best_method=best_method,
            graph_score=graph_score,
            vector_score=vector_score,
            hybrid_score=hybrid_score,
        )

        return Response(
            {
                "query": query_text,
                "graph_results": graph_results,
                "vector_results": vector_results,
                "hybrid_answer": hybrid_answer,
                "best_method": best_method,
                "response_time": response_time,
            }
        )

    except Exception as e:
        print("🔥 QUERY ERROR:", str(e))  # 🔥 DEBUG
        return Response({"error": str(e)}, status=500)


# =========================
# 2. GRAPH ONLY QUERY
# =========================
@api_view(["POST"])
def graph_only_query(request):
    query = request.data.get("query")

    if not query:
        return Response({"error": "Query required"}, status=400)

    entity = extract_main_entity(query)
    result = find_entity_neighbors(entity)

    return Response({"query": query, "entity": entity, "graph_result": result})


# =========================
# 3. VECTOR ONLY QUERY
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])  # ADD THIS (IMPORTANT)
def vector_only_query(request):
    query = request.data.get("query")

    if not query:
        return Response({"error": "Query required"}, status=400)

    # USER-SPECIFIC SEARCH
    result = search(query, user_id=request.user.id)

    return Response({"query": query, "vector_result": result})


# =========================
# 4. COMPARE API
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def compare_query(request):
    try:
        query = request.data.get("query")

        if not query:
            return Response({"error": "Query required"}, status=400)

        # 🔹 USER-SPECIFIC HYBRID SEARCH
        results = hybrid_search(query, user_id=request.user.id)

        # 🔹 Generate answers for all modes
        graph_answer = generate_answer(query, results, mode="graph")
        vector_answer = generate_answer(query, results, mode="vector")
        hybrid_answer = generate_answer(query, results, mode="hybrid")

        return Response(
            {
                "query": query,
                "graph_answer": graph_answer,
                "vector_answer": vector_answer,
                "hybrid_answer": hybrid_answer,
                "graph_score": len(results.get("graph_results", [])),
                "vector_score": len(results.get("vector_results", [])),
                "hybrid_score": len(results.get("graph_results", []))
                + len(results.get("vector_results", [])),
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# 5. DOCUMENT UPLOAD
# =========================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_document(request):
    doc = None  # 🔥 FIX 1: for safe error handling

    try:
        print("\n===== UPLOAD START =====")

        file = request.FILES.get("file")

        if not file:
            return Response({"error": "File is required"}, status=400)

        print(f"✔ File received: {file.name}")

        # --------------------------
        # STEP 1: READ CONTENT
        # --------------------------
        try:
            print("➡️ Reading file content...")

            if file.name.endswith(".pdf"):
                print("📄 Detected PDF file")

                reader = PdfReader(file)
                content = ""

                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        content += text

                print("✔ PDF text extracted")

                file.seek(0)  # 🔥 FIX 2: reset file pointer (VERY IMPORTANT)

            else:
                print("📄 Detected TEXT file")
                content = file.read().decode("utf-8")

            if not content or not content.strip():  # 🔥 FIX 3: safer check
                print("❌ No content extracted")
                return Response({"error": "Empty document"}, status=400)

        except Exception as e:
            print("❌ ERROR reading file:", str(e))
            return Response({"error": "File reading failed"}, status=500)

        # --------------------------
        # STEP 2: SAVE DOCUMENT
        # --------------------------
        doc = Document.objects.create(
            user=request.user, name=file.name, file=file, status="processing"
        )

        # --------------------------
        # STEP 3: PROCESSING
        # --------------------------
        print("➡️ Extracting entities...")
        entities = extract_entities(content)

        print("➡️ Extracting relationships...")
        relationships = extract_relationships(content)

        print("➡️ Building graph...")
        build_graph(
            entities,
            relationships,
            source=file.name,
            user_id=request.user.id,
        )

        print("➡️ Adding to vector DB...")
        add_documents([content], user_id=request.user.id)

        # --------------------------
        # STEP 4: FINAL SAVE
        # --------------------------
        doc.status = "processed"
        doc.entity_count = len(entities)
        doc.relationship_count = len(relationships)
        doc.save()

        print("===== UPLOAD SUCCESS =====\n")

        return Response({"message": "Document processed", "document_id": doc.id})

    except Exception as e:
        print("🔥 CRITICAL ERROR:", str(e))

        if doc:  # 🔥 FIX 4: prevent "processing stuck"
            doc.status = "failed"
            doc.save()

        return Response({"error": str(e)}, status=500)


# =========================
# 6. LIST DOCUMENTS
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_documents(request):
    docs = Document.objects.filter(user=request.user).values()
    return Response({"documents": list(docs)})


# =========================
# 7. DELETE DOCUMENT
# =========================
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_document(request, doc_id):
    try:
        # 🔹 Step 1: Get document
        doc = Document.objects.get(id=doc_id, user=request.user)

        # 🔹 Step 2: Extract document name/content identifier
        doc_name = doc.name

        # --------------------------
        # 🔹 Step 3: DELETE FROM NEO4J
        # --------------------------
        try:
            from graphrag.services.neo4j_client import neo4j_client

            # Delete nodes related to this document
            neo4j_client.run_query(
                """
            MATCH (n:Entity)
            WHERE n.source = $doc_name
            DETACH DELETE n
            """,
                {"doc_name": doc_name},
            )

            print(f"✔ Neo4j cleaned for {doc_name}")

        except Exception as e:
            print("⚠ Neo4j cleanup failed:", str(e))

        # --------------------------
        # 🔹 Step 4: DELETE FROM VECTOR DB (CHROMADB)
        # --------------------------
        try:
            from graphrag.services.vector_retriever import vector_store

            # Delete embeddings using metadata filter
            vector_store._collection.delete(where={"source": doc_name})

            print(f"✔ Vector DB cleaned for {doc_name}")

        except Exception as e:
            print("⚠ Vector DB cleanup failed:", str(e))

        # --------------------------
        # 🔹 Step 5: DELETE FILE (OPTIONAL)
        # --------------------------
        try:
            if doc.file:
                doc.file.delete(save=False)
        except Exception as e:
            print("⚠ File delete failed:", str(e))

        # --------------------------
        # 🔹 Step 6: DELETE DB ENTRY
        # --------------------------
        doc.delete()

        return Response({"message": "Document fully deleted"})

    except Document.DoesNotExist:
        return Response({"error": "Document not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =========================
# 8. GRAPH DATA
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_graph(request):
    return Response(
        {
            "nodes": get_all_nodes(user_id=request.user.id),
            "relationships": get_all_relationships(user_id=request.user.id),
        }
    )


# =========================
# 9. ENTITY DETAILS
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_entity(request, name):
    result = find_entity_neighbors(name, user_id=request.user.id)

    return Response({"entity": name, "neighbors": result})


# =========================
# 10. PATH API (MULTIHOP)
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_path(request):
    source = request.GET.get("source")
    target = request.GET.get("target")

    if not source or not target:
        return Response({"error": "source & target required"}, status=400)

    paths = find_multihop_paths(source, target)

    return Response({"source": source, "target": target, "paths": paths})


# =========================
# 11. CYPHER EXECUTION
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def run_cypher(request):
    query = request.data.get("query")

    if not query:
        return Response({"error": "Cypher query required"}, status=400)

    result = neo4j_client.run_query(query)

    return Response({"result": result})


# =========================
# 12. GRAPH STATS
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def graph_stats(request):
    nodes = get_all_nodes()
    rels = get_all_relationships()

    return Response({"total_nodes": len(nodes), "total_relationships": len(rels)})


# =========================
# 13. COMMUNITY API
# =========================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_communities(request):
    return Response({"communities": detect_communities()})


# =========================
# 14. SEARCH ENTITIES
# =========================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def search_entities(request):
    query = request.data.get("query", "").lower()

    nodes = get_all_nodes()
    results = [n for n in nodes if query in n["name"].lower()]

    return Response({"results": results})


# =========================
# 15. HEALTH CHECK
# =========================
@api_view(["GET"])
def health_check(request):
    try:
        neo4j_client.run_query("RETURN 1")

        return Response({"status": "ok", "neo4j": "connected"})

    except:
        return Response({"status": "error"}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_evaluations(request):
    data = (
        Evaluation.objects.select_related("query")
        .filter(query__user=request.user)
        .values(
            "id",
            "query__query_text",
            "best_method",
            "graph_score",
            "vector_score",
            "hybrid_score",
            "created_at",
        )
    )

    return Response({"evaluations": list(data)})


def calculate_scores(query, graph_results, vector_results, hybrid_answer):
    """
    Simple scoring logic (requirement-aligned)
    """

    query_lower = query.lower()

    graph_score = 1 if graph_results else 0

    vector_score = 1 if vector_results else 0

    hybrid_score = 1 if hybrid_answer and len(hybrid_answer) > 0 else 0

    return graph_score, vector_score, hybrid_score
