from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

from app.config import settings
from app.services.calendar_server import build_calendar_tools

CALENDAR_PROMPT_SUFFIX = """
You also have calendar tools available. When you and the person land on a concrete plan that has \
a specific day/time (e.g. "write the report tomorrow at 2pm for an hour"), ask them if they'd like \
you to add it to their calendar. Only call the add_to_calendar tool after they clearly confirm \
(e.g. they say "yes", "sure", "add it"). Never call add_to_calendar without an explicit confirmation."""


def _build_model() -> ChatOpenAI:
    return ChatOpenAI(
        base_url="https://router.huggingface.co/v1",
        api_key=settings.HF_API_TOKEN.get_secret_value(),
        model=settings.MODEL.get_secret_value(),
        max_tokens=600,
        temperature=0.7,
    )


async def run_chat_agent(system_prompt: str, messages: list[dict], session_id: str) -> tuple[str, bool]:
    """Run the LangGraph react agent for one turn.

    Returns (assistant_text, calendar_event_added).
    """
    tools = build_calendar_tools(session_id)
    agent = create_react_agent(_build_model(), tools)

    full_messages = [{"role": "system", "content": system_prompt + CALENDAR_PROMPT_SUFFIX}, *messages]
    result = await agent.ainvoke({"messages": full_messages})

    result_messages = result["messages"]

    calendar_event_added = any(
        getattr(msg, "name", None) == "add_to_calendar"
        for msg in result_messages
    )

    ai_text = ""
    for msg in reversed(result_messages):
        content = getattr(msg, "content", None)
        if getattr(msg, "type", None) == "ai" and content:
            ai_text = content
            break

    return ai_text, calendar_event_added
