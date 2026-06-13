import sys
import json
from agents import build_reader_agent, build_search_agent, writer_chain, critic_chain

def run_research_pipeline(topic: str):
    state = {}

    # Step 1: Search
    # sys.stdout.flush() નો ઉપયોગ દરેક સ્ટેપ પછી મેસેજ મોકલવા માટે કરો
    print("[STATUS] [STEP-1] Search Agent is working...", flush=True)
    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })
    state["search_results"] = search_result['messages'][-1].content

    # Step 2: Reader
    print("[STATUS] [STEP-2] Reader Agent is scraping top resources...", flush=True)
    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [("user", f"Based on search results about '{topic}', scrape the best URL.\n\nResults:\n{state['search_results'][:800]}")]
    })
    state['scraped_content'] = reader_result['messages'][-1].content

    # Step 3: Writer
    print("[STATUS] [STEP-3] Writer Chain is drafting the report...", flush=True)
    research_combined = f"SEARCH RESULTS:\n{state['search_results']}\n\nCONTENT:\n{state['scraped_content']}"
    state["report"] = writer_chain.invoke({"topic": topic, "research": research_combined})

    # Step 4: Critic
    print("[STATUS] [STEP-4] Critic Chain is reviewing the report...", flush=True)
    state["feedback"] = critic_chain.invoke({"report": state['report']})

    # ફાઇનલ રિઝલ્ટ મોકલો
    print("[FINAL_RESULT]", flush=True)
    print(json.dumps(state), flush=True)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_topic = sys.argv[1]
        run_research_pipeline(target_topic)