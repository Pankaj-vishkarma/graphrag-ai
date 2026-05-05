def normalize_text(text: str):
    return text.strip().lower()


def resolve_entities(entities):
    """
    Input:
    [
      {"name": "Elon Musk", "type": "Person"},
      {"name": "elon musk", "type": "Person"}
    ]

    Output:
    [
      {"name": "Elon Musk", "type": "Person"}
    ]
    """

    unique_entities = {}

    for entity in entities:
        key = normalize_text(entity["name"])

        if key not in unique_entities:
            unique_entities[key] = {
                "name": entity["name"],
                "type": entity.get("type", "Unknown"),
            }

    return list(unique_entities.values())


def normalize_relationships(relationships):
    """
    Normalize relation names
    """

    normalized = []

    for rel in relationships:
        normalized.append(
            {
                "source": rel["source"].strip(),
                "relation": rel["relation"].strip().lower().replace(" ", "_"),
                "target": rel["target"].strip(),
            }
        )

    return normalized
