import os

from ics import Calendar, Event
from langchain_core.tools import tool

from app.config import settings


def _plan_path(session_id: str) -> str:
    if session_id != os.path.basename(session_id):
        raise ValueError("Invalid session id")
    session_dir = os.path.join(settings.DATA_DIR, "sessions", session_id)
    os.makedirs(session_dir, exist_ok=True)
    return os.path.join(session_dir, "plan.ics")


def build_calendar_tools(session_id: str) -> list:
    """Build calendar tools bound to a single session's plan.ics file."""

    @tool
    def add_to_calendar(events: list[dict]) -> str:
        """Write planned work blocks to the user's calendar.
        Each event: {"title": str, "start": ISO8601, "end": ISO8601}."""
        cal = Calendar()
        for e in events:
            cal.events.add(Event(name=e["title"], begin=e["start"], end=e["end"]))
        with open(_plan_path(session_id), "w") as f:
            f.writelines(cal)
        return f"Wrote {len(events)} blocks to the calendar"

    @tool
    def get_existing_blocks() -> list[dict]:
        """Return blocks already on the user's calendar so the planner can avoid conflicts."""
        try:
            with open(_plan_path(session_id)) as f:
                cal = Calendar(f.read())
            return [{"title": e.name, "start": str(e.begin), "end": str(e.end)} for e in cal.events]
        except FileNotFoundError:
            return []

    return [add_to_calendar, get_existing_blocks]
