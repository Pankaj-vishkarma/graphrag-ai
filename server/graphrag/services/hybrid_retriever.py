from graphrag.services.graph_retriever import find_entity_neighbors
from graphrag.services.vector_retriever import search
from graphrag.services.entity_extractor import extract_entities


# =========================
# ENTITY EXTRACTION
# =========================
def extract_main_entity(query: str):
    """
    Extract main entity using LLM (no hardcoding)
    """
    try:
        entities = extract_entities(query)

        if entities and len(entities) > 0:
            return entities[0]["name"]

    except Exception as e:
        print("Entity extraction error:", e)

    return None


# =========================
# HYBRID SEARCH
# =========================
def hybrid_search(query: str, user_id=None):
    """
    Combine graph + vector retrieval (LangChain-ready)
    """

    # 🔹 VECTOR SEARCH
    vector_results = []
    try:
        # USER-SPECIFIC VECTOR SEARCH
        raw_vector = search(query, user_id=user_id)

        # Normalize format
        vector_results = [
            {"text": doc, "score": float(score)} for doc, score in raw_vector
        ]

    except Exception as e:
        print("Vector search error:", e)

    # 🔹 GRAPH SEARCH
    graph_results = []
    entity = extract_main_entity(query)

    if entity:
        try:
            # USER-SPECIFIC GRAPH SEARCH
            raw_graph = find_entity_neighbors(entity, user_id=user_id)

            # Normalize format
            graph_results = [
                {
                    "source": rel["source"],
                    "relation": rel["relation"],
                    "target": rel["target"],
                }
                for rel in raw_graph
            ]

        except Exception as e:
            print("Graph search error:", e)

    # 🔹 FINAL STRUCTURED OUTPUT
    return {
        "query": query,
        "entity": entity,
        "vector_results": vector_results,
        "graph_results": graph_results,
    }
