import sys
import json
import traceback
from agents import build_reader_agent, build_search_agent, writer_chain, critic_chain

def run_research_pipeline(topic: str):
    state = {}
    try:
        # Step 1: Search
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
            "messages": [("user", f"Based on search results about '{topic}', scrape the best content.\n\nResults:\n{state['search_results'][:1000]}")]
        })
        state['scraped_content'] = reader_result['messages'][-1].content

        # Step 3: Writer
        print("[STATUS] [STEP-3] Writer Chain is drafting the report...", flush=True)
        research_combined = f"SEARCH RESULTS:\n{state['search_results']}\n\nCONTENT:\n{state['scraped_content']}"
        state["report"] = writer_chain.invoke({"topic": topic, "research": research_combined})

        # Step 4: Critic
        print("[STATUS] [STEP-4] Critic Chain is reviewing the report...", flush=True)
        state["feedback"] = critic_chain.invoke({"report": state['report']})

        print("[FINAL_RESULT]", flush=True)
        print(json.dumps(state), flush=True)
        sys.stdout.flush()

    except Exception as e:
        print(f"\n[ERROR] Pipeline Execution Failed: {str(e)}", flush=True)
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_topic = " ".join(sys.argv[1:])
        run_research_pipeline(target_topic)
    else:
        print("[ERROR] No topic provided", flush=True)
        sys.exit(1)