from typing import TypedDict, List, Dict, Any, Optional

class ResearchState(TypedDict):
    topic: str
    session_id: Optional[str]
    search_results: str
    scraped_content: str
    vector_context: str
    report: str
    feedback: str
    score: int
    revision_count: int
    current_step: str
    step_messages: List[str]
