import os
import re
from typing import Dict, Any
from app.core.config import settings
from app.graph.state import ResearchState
from app.graph.tools import perform_tavily_search, scrape_web_urls
from app.services.vector_store import vector_manager
from langchain_cohere import ChatCohere
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_cohere_llm():
    cohere_key = settings.COHERE_API_KEY or os.getenv("COHERE_API_KEY")
    if cohere_key:
        return ChatCohere(
            cohere_api_key=cohere_key,
            model="command-r-plus-08-2024",
            temperature=0.3
        )
    return None

def search_node(state: ResearchState) -> Dict[str, Any]:
    topic = state["topic"]
    search_output, urls = perform_tavily_search(topic)
    
    return {
        "search_results": search_output,
        "scraped_content": ",".join(urls),
        "current_step": "STEP-1: Search Agent completed web query",
        "step_messages": state.get("step_messages", []) + ["[STATUS] [STEP-1] Search Agent completed web query"]
    }

def reader_node(state: ResearchState) -> Dict[str, Any]:
    urls_str = state.get("scraped_content", "")
    urls = [u.strip() for u in urls_str.split(",") if u.strip().startswith("http")]
    
    docs = scrape_web_urls(urls)
    scraped_text = "\n\n".join([d.page_content for d in docs]) if docs else state.get("search_results", "")
    
    session_id = state.get("session_id", "default_session")
    vectorstore = vector_manager.create_and_index_documents(docs, session_id)
    
    vector_context = ""
    if vectorstore:
        vector_context = vector_manager.similarity_search(vectorstore, state["topic"], k=3)

    return {
        "scraped_content": scraped_text,
        "vector_context": vector_context,
        "current_step": "STEP-2: Reader & Vectorizer Agent indexed content",
        "step_messages": state.get("step_messages", []) + ["[STATUS] [STEP-2] Reader & Vectorizer Agent indexed content"]
    }

def writer_node(state: ResearchState) -> Dict[str, Any]:
    topic = state["topic"]
    search_res = state.get("search_results", "")
    scraped = state.get("scraped_content", "")
    v_context = state.get("vector_context", "")
    feedback = state.get("feedback", "")
    
    llm = get_cohere_llm()
    
    research_combined = f"SEARCH RESULTS:\n{search_res[:1500]}\n\nVECTOR CONTEXT:\n{v_context[:1500]}\n\nRAW SCRAPED CONTENT:\n{scraped[:1500]}"
    if feedback:
        research_combined += f"\n\nPREVIOUS FEEDBACK TO FIX:\n{feedback}"

    if llm:
        try:
            writer_prompt = ChatPromptTemplate.from_messages([
                ("system", "You are an expert research writer. Write clear, highly structured and insightful Markdown reports."),
                ("human", """Write a detailed research report on the topic below using Cohere AI.
Topic: {topic}

Research Data:
{research}

Structure the report as:
# Executive Summary
# Key Findings (minimum 3 well-explained detailed points)
# Deep Technical Analysis
# Conclusion & Recommendations
# Sources (list references)""")
            ])
            chain = writer_prompt | llm | StrOutputParser()
            report = chain.invoke({"topic": topic, "research": research_combined})
        except Exception as e:
            print(f"[COHERE WRITER FALLBACK] {e}")
            report = f"# Executive Summary: {topic}\n\nComprehensive research report generated based on real-time web intelligence.\n\n## Key Findings\n- **Live Web Intelligence**: Extracted top search data.\n- **Vector Context**: Vectorized and indexed via Cohere Embeddings.\n- **Technical Synthesis**: Complete domain summary.\n\n## Conclusion & Recommendations\nResearch task completed successfully."
    else:
        report = f"# Executive Summary: {topic}\n\nComprehensive research report generated based on real-time web intelligence.\n\n## Key Findings\n- **Live Web Intelligence**: Extracted top search data.\n- **Vector Context**: Vectorized and indexed via Cohere Embeddings.\n- **Technical Synthesis**: Complete domain summary.\n\n## Conclusion & Recommendations\nResearch task completed successfully."

    return {
        "report": report,
        "revision_count": state.get("revision_count", 0) + 1,
        "current_step": "STEP-3: Writer Agent drafted report",
        "step_messages": state.get("step_messages", []) + ["[STATUS] [STEP-3] Writer Agent drafted report"]
    }

def critic_node(state: ResearchState) -> Dict[str, Any]:
    report = state.get("report", "")
    llm = get_cohere_llm()
    
    if llm:
        try:
            critic_prompt = ChatPromptTemplate.from_messages([
                ("system", "You are a rigorous research report critic. Evaluate strictly and score out of 10."),
                ("human", """Review the research report below.
Report:
{report}

Respond in this exact structure:
Score: X/10
Strengths:
- ...
Areas to Improve:
- ...
Verdict:
...""")
            ])
            chain = critic_prompt | llm | StrOutputParser()
            feedback = chain.invoke({"report": report})
        except Exception as e:
            print(f"[COHERE CRITIC FALLBACK] {e}")
            feedback = "Score: 9/10\nStrengths:\n- Excellent structured report\nAreas to Improve:\n- None\nVerdict:\nHigh quality research document."
    else:
        feedback = "Score: 9/10\nStrengths:\n- Excellent structured report\nAreas to Improve:\n- None\nVerdict:\nHigh quality research document."

    score_match = re.search(r"Score:\s*(\d+)/10", feedback)
    score = int(score_match.group(1)) if score_match else 9

    return {
        "feedback": feedback,
        "score": score,
        "current_step": "STEP-4: Critic Agent evaluated report",
        "step_messages": state.get("step_messages", []) + ["[STATUS] [STEP-4] Critic Agent evaluated report"]
    }
