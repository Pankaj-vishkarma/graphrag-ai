from django.conf import settings
from groq import Groq

# LangChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

client = Groq(api_key=settings.GROQ_API_KEY)


# =========================
# LLM CALL WRAPPER
# =========================
def call_llm(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
    )
    return response.choices[0].message.content.strip()


# =========================
# MAIN FUNCTION
# =========================
def generate_cypher(query: str):
    """
    Convert natural language to Cypher using LangChain
    """

    try:
        # 🔹 Prompt Template (LangChain)
        prompt = ChatPromptTemplate.from_template("""
Convert the following natural language query into a Neo4j Cypher query.

Only return the Cypher query.

Examples:

Q: Who founded SpaceX?
A: MATCH (a)-[:FOUNDED]->(b {{name: "SpaceX"}}) RETURN a

Q: Where is SpaceX located?
A: MATCH (a {{name: "SpaceX"}})-[:LOCATED_IN]->(b) RETURN b

Query:
{query}
""")

        # 🔹 Chain
        chain = prompt | (lambda x: call_llm(x.to_string())) | StrOutputParser()

        # 🔹 Execute
        cypher_query = chain.invoke({"query": query})

        return cypher_query.strip()

    except Exception as e:
        print("Cypher generation error:", e)
        return None
