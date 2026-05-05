from graphrag.services.neo4j_client import neo4j_client
from graphrag.services.rag_chain import generate_answer
from collections import defaultdict


def detect_communities():
    """
    Community detection using Python (no GDS dependency)
    Groups connected nodes into clusters
    + LLM-based summaries
    """

    try:
        # 🔹 Step 1: Get all relationships
        data = neo4j_client.run_query("""
        MATCH (a:Entity)-[r]->(b:Entity)
        RETURN a.name AS source, b.name AS target
        """)

        if not data:
            return []

        # 🔹 Step 2: Build adjacency list
        graph = defaultdict(set)

        for row in data:
            source = row.get("source")
            target = row.get("target")

            if not source or not target:
                continue

            graph[source].add(target)
            graph[target].add(source)

        # 🔹 Step 3: Find connected components (communities)
        visited = set()
        communities = []

        def dfs(node, community):
            visited.add(node)
            community.append(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    dfs(neighbor, community)

        for node in graph:
            if node not in visited:
                community = []
                dfs(node, community)
                communities.append(community)

        # 🔹 Step 4: Generate result with LLM summaries
        result = []

        for i, community in enumerate(communities):
            try:
                # Limit size to avoid very long prompts
                sample_entities = community[:10]

                summary = generate_answer(
                    f"Explain how these entities are related in one short paragraph: {', '.join(sample_entities)}"
                )

            except Exception as e:
                print("Summary generation error:", e)
                summary = f"This group contains {len(community)} related entities."

            result.append(
                {
                    "id": i,
                    "entities": community,
                    "label": f"Community {i+1}",
                    "summary": summary,
                }
            )

        return result

    except Exception as e:
        print("Community detection error:", e)
        return []
