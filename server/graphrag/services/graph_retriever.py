from graphrag.services.neo4j_client import neo4j_client


def get_all_nodes(user_id=None):
    query = """
    MATCH (n:Entity)
    """

    params = {}

    if user_id:
        query += "\nWHERE n.user_id = $user_id"
        params["user_id"] = user_id

    query += """
    RETURN 
        n.name AS id,
        n.name AS name,
        n.type AS type
    """

    return neo4j_client.run_query(query, params)


def get_all_relationships(user_id=None):
    query = """
    MATCH (a:Entity)-[r]->(b:Entity)
    """

    params = {}

    if user_id:
        query += "\nWHERE a.user_id = $user_id AND b.user_id = $user_id"
        params["user_id"] = user_id

    query += """
    RETURN 
        a.name AS source,
        b.name AS target
    """

    return neo4j_client.run_query(query, params)


def find_entity_neighbors(entity_name: str, user_id=None):
    query = """
    MATCH (a:Entity {name: $name})-[r]-(b:Entity)
    """

    params = {"name": entity_name}

    if user_id:
        query += "\nWHERE a.user_id = $user_id AND b.user_id = $user_id"
        params["user_id"] = user_id

    query += """
    RETURN 
        a.name AS source,
        b.name AS target,
        type(r) AS relation
    """

    return neo4j_client.run_query(query, params)


def find_path_between_entities(source: str, target: str, user_id=None):
    query = """
    MATCH p = shortestPath(
        (a:Entity {name: $source})-[*..5]-(b:Entity {name: $target})
    )
    """

    params = {"source": source, "target": target}

    if user_id:
        query += "\nWHERE a.user_id = $user_id AND b.user_id = $user_id"
        params["user_id"] = user_id

    query += "\nRETURN p"

    return neo4j_client.run_query(query, params)
