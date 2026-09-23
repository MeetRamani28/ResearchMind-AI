import os
import re
from typing import Dict, Any
from app.core.config import settings
from langchain_cohere import ChatCohere
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

def get_router_cohere_llm():
    cohere_key = settings.COHERE_API_KEY or os.getenv("COHERE_API_KEY")
    if cohere_key:
        return ChatCohere(
            cohere_api_key=cohere_key,
            model="command-r-plus-08-2024",
            temperature=0.3
        )
    return None

def classify_prompt_intent(prompt: str) -> str:
    """Classifies user prompt as 'GREETING' or 'RESEARCH' using fast regex matching first for instant response."""
    prompt_clean = prompt.strip().lower()
    
    # Fast regex match for instant <1ms routing
    greeting_patterns = [
        r"^(hi|hello|hey|greetings|good morning|good evening|good afternoon|namaste|kem cho|kese ho|kaise ho|how are you|su khabar)\b",
        r"^(who are you|what can you do|tell me about yourself|introduce yourself|aapkeseho|kemcho)\b",
        r"^(give me a current demands|what is|tell me|explain)\b"
    ]
    
    for pattern in greeting_patterns:
        if re.search(pattern, prompt_clean):
            if len(prompt_clean.split()) <= 10:
                return "GREETING"

    # If long query or complex research query
    if len(prompt_clean.split()) <= 4:
        return "GREETING"

    llm = get_router_cohere_llm()
    if not llm:
        return "GREETING" if len(prompt_clean.split()) <= 6 else "RESEARCH"

    try:
        router_prompt = ChatPromptTemplate.from_messages([
            ("system", "You are an intent classifier. Categorize user prompts as either GREETING (for greetings, general chit-chat, direct questions, or simple conversational questions in English/Hindi/Gujarati) or RESEARCH (for heavy technical inquiries requiring multi-page report generation). Respond ONLY with the single word GREETING or RESEARCH."),
            ("human", "{prompt}")
        ])
        chain = router_prompt | llm | StrOutputParser()
        intent = chain.invoke({"prompt": prompt}).strip().upper()
        return "GREETING" if "GREETING" in intent else "RESEARCH"
    except Exception as e:
        print(f"[INTENT ROUTER FALLBACK] {e}")
        return "GREETING" if len(prompt_clean.split()) <= 6 else "RESEARCH"

def generate_direct_conversational_response(prompt: str) -> str:
    """Generates a direct, polite answer using clean Markdown formatting matching the user's language."""
    llm = get_router_cohere_llm()
    if not llm:
        return "Hello! I am ResearchMind-AI. How can I assist your research today?"

    try:
        conv_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are ResearchMind-AI, an advanced AI Assistant built for full-stack research.
Answer the user directly, politely, and cleanly.

CRITICAL FORMATTING INSTRUCTIONS:
- Use clean Markdown formatting.
- If listing capabilities or items, put EVERY item on a NEW LINE with proper bullet format (`- **Item**: Description`).
- Use Markdown tables (`| Header | Header |`) if presenting structured capabilities or comparisons.
- Do NOT smash multiple bullet points into one single line.

CRITICAL LANGUAGE REQUIREMENT:
- If the user talks in English, respond in English.
- If the user talks in Hindi, respond in Hindi.
- If the user talks in Gujarati, respond in Gujarati."""),
            ("human", "{prompt}")
        ])
        chain = conv_prompt | llm | StrOutputParser()
        return chain.invoke({"prompt": prompt})
    except Exception as e:
        print(f"[DIRECT CONVERSATIONAL RESPONSE FALLBACK] {e}")
        return "Hello! How can I help you with your research today?"
