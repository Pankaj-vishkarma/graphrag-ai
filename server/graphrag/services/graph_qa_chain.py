from graphrag.services.nl_to_cypher import generate_cypher
from graphrag.services.neo4j_client import neo4j_client

# LangChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

from django.conf import settings
from groq import Groq

client = Groq(api_key=settings.GROQ_API_KEY)


# =========================
# LLM CALL
# =========================
def call_llm(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content


# =========================
# GRAPH QA MAIN FUNCTION
# =========================
def graph_qa(query: str):
    """
    LangChain-powered Graph QA
    """

    try:
        # 🔹 Step 1: NL → Cypher
        cypher_query = generate_cypher(query)

        if not cypher_query:
            return {"error": "Failed to generate Cypher query"}

        # 🔹 Step 2: Execute on Neo4j
        graph_result = neo4j_client.run_query(cypher_query)

        # 🔹 Step 3: Prompt (LangChain)
        prompt = ChatPromptTemplate.from_template("""
You are an AI assistant.

Use the graph query result below to answer the question.

Cypher Query:
{cypher}

Graph Result:
{result}

Question:
{question}

Answer clearly.
""")

        # 🔹 Step 4: Chain
        chain = prompt | (lambda x: call_llm(x.to_string())) | StrOutputParser()

        # 🔹 Step 5: Execute
        answer = chain.invoke(
            {
                "cypher": cypher_query,
                "result": str(graph_result),
                "question": query,
            }
        )

        return {
            "query": query,
            "cypher": cypher_query,
            "result": graph_result,
            "answer": answer,
        }

    except Exception as e:
        print("Graph QA error:", e)
        return {"error": str(e)}
