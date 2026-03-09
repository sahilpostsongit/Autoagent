from typing import Annotated, Callable, Optional
from datetime import datetime, timezone

from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict

from app.agent.tools import ALL_TOOLS
from app.core.config import get_settings

settings = get_settings()


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]
    steps: list[dict]
    goal: str


SYSTEM_PROMPT = """You are AutoAgent, a highly capable autonomous AI assistant.

You have access to the following tools:
- web_search: Search the internet for current information
- execute_code: Run Python code for calculations and logic
- analyze_data: Analyze uploaded CSV/JSON/Excel files with pandas
- file_tool: Read, write, list, and delete files in your workspace

Your approach:
1. Break the goal into clear sub-tasks
2. Choose the right tool for each sub-task
3. Reflect on tool outputs before the next step
4. Write a comprehensive, well-structured final answer

Rules:
- Think out loud — explain what you are doing at each step
- If a tool fails, try an alternative approach
- Always verify information before using it as fact
"""


def build_agent(stream_callback: Optional[Callable] = None):
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        temperature=0,
        max_tokens=4096,
        streaming=True,
    ).bind_tools(ALL_TOOLS)

    tool_node = ToolNode(ALL_TOOLS)

    async def agent_node(state: AgentState) -> AgentState:
        messages = state["messages"]
        steps = state.get("steps", [])
        response = await llm.ainvoke(messages)

        step_entry = {
            "type": "thinking",
            "content": response.content if isinstance(response.content, str) else str(response.content),
            "tool": None,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        if response.tool_calls:
            for tc in response.tool_calls:
                step_entry = {
                    "type": "tool_call",
                    "content": f"Calling tool: {tc['name']}",
                    "tool": tc["name"],
                    "tool_input": str(tc.get("args", {}))[:500],
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                steps.append(step_entry)
                if stream_callback:
                    await stream_callback(step_entry)
        else:
            steps.append(step_entry)
            if stream_callback:
                await stream_callback({**step_entry, "type": "final"})

        return {"messages": [response], "steps": steps}

    async def tool_node_with_logging(state: AgentState) -> AgentState:
        steps = state.get("steps", [])
        result = await tool_node.ainvoke(state)

        for msg in result.get("messages", []):
            if hasattr(msg, "name"):
                step_entry = {
                    "type": "tool_result",
                    "content": str(msg.content)[:800],
                    "tool": msg.name,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
                steps.append(step_entry)
                if stream_callback:
                    await stream_callback(step_entry)

        return {**result, "steps": steps}

    def should_continue(state: AgentState) -> str:
        last = state["messages"][-1]
        if hasattr(last, "tool_calls") and last.tool_calls:
            return "tools"
        return END

    graph = StateGraph(AgentState)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node_with_logging)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue)
    graph.add_edge("tools", "agent")

    return graph.compile()


async def run_agent(goal: str, stream_callback: Optional[Callable] = None) -> dict:
    agent = build_agent(stream_callback=stream_callback)

    initial_state: AgentState = {
        "goal": goal,
        "steps": [],
        "messages": [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f"Goal: {goal}"),
        ],
    }

    try:
        final_state = await agent.ainvoke(initial_state)
        messages = final_state["messages"]

        final_answer = ""
        for msg in reversed(messages):
            if isinstance(msg, AIMessage) and not getattr(msg, "tool_calls", None):
                final_answer = msg.content if isinstance(msg.content, str) else str(msg.content)
                break

        return {
            "success": True,
            "answer": final_answer,
            "steps": final_state.get("steps", []),
            "error": None,
        }

    except Exception as e:
        return {"success": False, "answer": "", "steps": [], "error": str(e)}