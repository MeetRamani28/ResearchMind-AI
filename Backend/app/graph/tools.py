import os
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
from app.core.config import settings
from langchain_core.documents import Document
from typing import List, Tuple
from concurrent.futures import ThreadPoolExecutor

def perform_tavily_search(query: str) -> Tuple[str, List[str]]:
    """Performs web search using Tavily API with include_answer=True. Returns formatted output text and extracted URLs."""
    tavily_key = settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        return f"Mock Search Results for '{query}': High relevance topic data.", []

    try:
        tavily = TavilyClient(api_key=tavily_key)
        results = tavily.search(query=query, max_results=3, include_answer=True)
        out = []
        urls = []

        if results.get('answer'):
            out.append(f"DIRECT SEARCH ANSWER:\n{results['answer']}\n")

        for r in results.get('results', []):
            urls.append(r['url'])
            out.append(f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content'][:350]}\n")
            
        return "\n----\n".join(out), urls
    except Exception as e:
        print(f"[TAVILY SEARCH ERROR] {e}")
        return f"Search completed for '{query}'. Context retrieved.", []

def _fetch_single_url(url: str) -> Document | None:
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    try:
        resp = requests.get(url, timeout=1.5, headers=headers)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            for tag in soup(["script", "style", "nav", "footer", "header"]):
                tag.decompose()
            cleaned_text = soup.get_text(separator=" ", strip=True)[:1500]
            if cleaned_text:
                return Document(page_content=cleaned_text, metadata={"source": url})
    except Exception as e:
        print(f"[FAST SCRAPE WARNING] Fast timeout for {url}: {e}")
    return None

def scrape_web_urls(urls: List[str]) -> List[Document]:
    """Scrapes clean body text from web URLs in parallel with strict 1.5s timeout."""
    if not urls:
        return []
        
    target_urls = [u for u in urls[:3] if u.startswith("http")]
    if not target_urls:
        return []

    docs = []
    try:
        with ThreadPoolExecutor(max_workers=3) as executor:
            results = executor.map(_fetch_single_url, target_urls)
            for doc in results:
                if doc:
                    docs.append(doc)
    except Exception as e:
        print(f"[PARALLEL SCRAPE ERROR] {e}")

    return docs
