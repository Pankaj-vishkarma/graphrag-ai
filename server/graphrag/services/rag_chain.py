from graphrag.services.hybrid_retriever import hybrid_search
from django.conf import settings
from groq import Groq

# LangChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

client = Groq(api_key=settings.GROQ_API_KEY)


# =========================
# LLM CALL (WRAPPED)
# =========================
def call_llm(prompt: str):
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    return response.choices[0].message.content


# =========================
# CONTEXT BUILDER
# =========================
def build_context(results):
    """
    Convert graph + vector results into structured context
    """

    vector_context = []
    graph_context = []

    # Vector context
    for doc, score in results.get("vector_results", []):
        vector_context.append(doc)

    # Graph context
    for rel in results.get("graph_results", []):
        graph_context.append(f"{rel['source']} {rel['relation']} {rel['target']}")

    return {
        "vector_context": "\n".join(vector_context),
        "graph_context": "\n".join(graph_context),
    }


# =========================
# MAIN RAG FUNCTION
# =========================
def generate_answer(query: str, context_data=None, mode="hybrid", user_id=None):
    """
    LangChain-powered GraphRAG pipeline with modes:
    - graph
    - vector
    - hybrid
    """

    try:
        # 🔹 Step 1: Use provided context OR fetch
        if context_data is None:
            # USER-SPECIFIC HYBRID SEARCH
            results = hybrid_search(query, user_id=user_id)
        else:
            results = context_data

        context = build_context(results)

        # 🔹 Step 2: Select context based on mode
        if mode == "graph":
            graph_context = context["graph_context"]
            vector_context = ""

        elif mode == "vector":
            graph_context = ""
            vector_context = context["vector_context"]

        else:  # hybrid
            graph_context = context["graph_context"]
            vector_context = context["vector_context"]

        # 🔹 Step 3: Prompt
        prompt = ChatPromptTemplate.from_template("""
You are an AI assistant.

Use the provided context to answer the question.

GRAPH CONTEXT:
{graph_context}

VECTOR CONTEXT:
{vector_context}

QUESTION:
{question}

Answer clearly and concisely.
""")

        # 🔹 Step 4: Chain
        chain = prompt | (lambda x: call_llm(x.to_string())) | StrOutputParser()

        # 🔹 Step 5: Execute
        response = chain.invoke(
            {
                "graph_context": graph_context,
                "vector_context": vector_context,
                "question": query,
            }
        )

        return response

    except Exception as e:
        print("RAG error:", e)
        return "Error generating answer"
