from graphrag.services.neo4j_client import neo4j_client


def find_multihop_paths(source: str, target: str):
    query = """
    MATCH p = shortestPath(
        (a:Entity {name: $source})-[*..5]-(b:Entity {name: $target})
    )
    RETURN p
    """

    try:
        return neo4j_client.run_query(query, {"source": source, "target": target})
    except Exception as e:
        print("Multihop error:", e)
        return []
