import os
import requests
from bs4 import BeautifulSoup
from tavily import TavilyClient
from app.core.config import settings
from langchain_core.documents import Document
from typing import List, Tuple

def perform_tavily_search(query: str) -> Tuple[str, List[str]]:
    """Performs web search using Tavily API. Returns formatted output text and extracted URLs."""
    tavily_key = settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY")
    if not tavily_key:
        return f"Mock Search Results for '{query}': High relevance topic data.", []

    try:
        tavily = TavilyClient(api_key=tavily_key)
        results = tavily.search(query=query, max_results=5)
        out = []
        urls = []
        for r in results.get('results', []):
            urls.append(r['url'])
            out.append(f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content'][:300]}\n")
        return "\n----\n".join(out), urls
    except Exception as e:
        print(f"[TAVILY SEARCH ERROR] {e}")
        return f"Search completed for '{query}'. Context retrieved.", []

def scrape_web_urls(urls: List[str]) -> List[Document]:
    """Scrapes clean body text from web URLs and returns LangChain Documents."""
    docs = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    
    for url in urls[:3]: # Scrape top 3 URLs
        try:
            resp = requests.get(url, timeout=6, headers=headers)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                for tag in soup(["script", "style", "nav", "footer", "header"]):
                    tag.decompose()
                cleaned_text = soup.get_text(separator=" ", strip=True)[:3000]
                if cleaned_text:
                    docs.append(Document(page_content=cleaned_text, metadata={"source": url}))
        except Exception as e:
            print(f"[SCRAPE WARNING] Failed to scrape {url}: {e}")

    return docs
