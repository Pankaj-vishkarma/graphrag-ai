from graphrag.services.neo4j_client import neo4j_client
import re


# =========================
# UTILS
# =========================
def clean_relation(rel):
    """
    Clean relationship string for Neo4j
    - Remove spaces
    - Uppercase
    - Remove special chars
    """
    if not rel:
        return "RELATED_TO"

    rel = str(rel).strip().replace(" ", "_").upper()
    rel = re.sub(r"[^A-Z0-9_]", "", rel)

    if not rel:
        return "RELATED_TO"

    return rel


# =========================
# CREATE NODE
# =========================
def create_entity_node(entity, source=None, user_id=None):
    """
    Create or merge a node in Neo4j with dynamic labels
    + optional source tracking
    + user isolation
    """

    try:
        if not entity or "name" not in entity:
            print(" Invalid entity:", entity)
            return None

        name = str(entity["name"]).strip()
        if not name:
            print(" Empty entity name:", entity)
            return None

        raw_type = entity.get("type", "Unknown")
        label = str(raw_type).strip().replace(" ", "_").title()
        label = re.sub(r"[^A-Za-z0-9_]", "", label)

        if not label:
            label = "Unknown"

        query = f"""
        MERGE (e:Entity {{name: $name}})
        SET e:{label}
        SET e.type = $type
        """

        params = {"name": name, "type": raw_type}

        # 🔥 ADD SOURCE (already present)
        if source:
            query += "\nSET e.source = $source"
            params["source"] = source

        # 🔥 ADD USER ID (NEW)
        if user_id:
            query += "\nSET e.user_id = $user_id"
            params["user_id"] = user_id

        query += "\nRETURN e"

        return neo4j_client.run_query(query, params)

    except Exception as e:
        print(" Error creating node:", str(e))
        return None


# =========================
# CREATE RELATIONSHIP
# =========================
def create_relationship(source, relation, target, user_id=None):
    """
    Create relationship between nodes with user isolation
    """

    try:
        if not source or not target:
            print(" Invalid relationship data:", source, relation, target)
            return None

        source = str(source).strip()
        target = str(target).strip()

        clean_rel = clean_relation(relation)

        query = f"""
        MATCH (a:Entity {{name: $source}})
        MATCH (b:Entity {{name: $target}})
        WHERE a.user_id = $user_id AND b.user_id = $user_id
        MERGE (a)-[r:{clean_rel}]->(b)
        RETURN a, r, b
        """

        params = {
            "source": source,
            "target": target,
            "user_id": user_id,
        }

        return neo4j_client.run_query(query, params)

    except Exception as e:
        print(" Error creating relationship:", str(e))
        return None


# =========================
# BUILD GRAPH
# =========================
def build_graph(entities, relationships, source=None, user_id=None):
    """
    Full pipeline with user isolation
    """

    nodes_created = 0
    relationships_created = 0

    print(" Creating nodes...")

    for entity in entities:
        result = create_entity_node(entity, source=source, user_id=user_id)
        if result is not None:
            nodes_created += 1

    print(f"✔ Nodes created: {nodes_created}")

    print(" Creating relationships...")

    for rel in relationships:
        try:
            if not isinstance(rel, dict):
                continue

            source_node = rel.get("source")
            relation = rel.get("relation")
            target = rel.get("target")

            if not source_node or not target:
                continue

            result = create_relationship(source_node, relation, target, user_id=user_id)

            if result is not None:
                relationships_created += 1

        except Exception as e:
            print(" Relationship processing error:", str(e))

    print(f"✔ Relationships created: {relationships_created}")

    return {
        "nodes_created": nodes_created,
        "relationships_created": relationships_created,
    }
