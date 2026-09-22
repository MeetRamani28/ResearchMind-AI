from langgraph.graph import StateGraph, END
from app.graph.state import ResearchState
from app.graph.nodes import search_node, reader_node, writer_node, critic_node

def should_continue_revision(state: ResearchState) -> str:
    """Conditional routing edge: if score < 7 and revision_count < 2, loop back to writer for self-correction."""
    score = state.get("score", 10)
    revision_count = state.get("revision_count", 1)
    
    if score < 7 and revision_count < 2:
        print(f"[LANGGRAPH SELF-CORRECTION] Score ({score}/10) below threshold. Triggering revision iteration #{revision_count}.")
        return "writer"
    return END

def create_research_graph():
    workflow = StateGraph(ResearchState)

    # Add Nodes
    workflow.add_node("search", search_node)
    workflow.add_node("reader", reader_node)
    workflow.add_node("writer", writer_node)
    workflow.add_node("critic", critic_node)

    # Set Entry Point
    workflow.set_entry_point("search")

    # Add Direct Edges
    workflow.add_edge("search", "reader")
    workflow.add_edge("reader", "writer")
    workflow.add_edge("writer", "critic")

    # Add Conditional Self-Correction Edge
    workflow.add_conditional_edges(
        "critic",
        should_continue_revision,
        {
            "writer": "writer",
            END: END
        }
    )

    return workflow.compile()

research_graph = create_research_graph()
