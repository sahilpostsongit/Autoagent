from langchain_core.tools import tool
from tavily import TavilyClient
from app.core.config import get_settings

settings = get_settings()


@tool
def web_search(query: str) -> str:
    """
    Search the web for current information.
    Use this when you need up-to-date facts, news, or data.
    Input: A clear search query string.
    Output: A summary of the top search results.
    """
    try:
        client = TavilyClient(api_key=settings.TAVILY_API_KEY)
        response = client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_answer=True,
        )

        output_parts = []

        if response.get("answer"):
            output_parts.append(f"📌 Quick Answer:\n{response['answer']}\n")

        if response.get("results"):
            output_parts.append("🔗 Sources:")
            for i, r in enumerate(response["results"][:5], 1):
                output_parts.append(
                    f"{i}. [{r.get('title', 'No title')}]({r.get('url', '')})\n"
                    f"   {r.get('content', '')[:300]}..."
                )

        return "\n".join(output_parts) if output_parts else "No results found."

    except Exception as e:
        return f"Web search failed: {str(e)}"