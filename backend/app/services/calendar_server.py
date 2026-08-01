from mcp.server.fastmcp import FastMCP
from ics import Calendar, Event

mcp = FastMCP("planner")

@mcp.tool()
def add_to_calendar(events: list[dict]) -> str:
    """Write planned work blocks to plan.ics.
    Each event: {"title": str, "start": ISO8601, "end": ISO8601}."""
    cal = Calendar()
    for e in events:
        cal.events.add(Event(name=e["title"], begin=e["start"], end=e["end"]))
    with open("plan.ics", "w") as f:
        f.writelines(cal)
    return f"Wrote {len(events)} blocks to plan.ics"

@mcp.tool()
def get_existing_blocks() -> list[dict]:
    """Return blocks already in plan.ics so the planner can avoid conflicts."""
    try:
        with open("plan.ics") as f:
            cal = Calendar(f.read())
        return [{"title": e.name, "start": str(e.begin), "end": str(e.end)} for e in cal.events]
    except FileNotFoundError:
        return []

if __name__ == "__main__":
    mcp.run()      # stdio transport