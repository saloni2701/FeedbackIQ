"""Plain-language summary and suggestions built from the analysed data (rule based)."""
from ..nlp.priority import priority_level


def mood_word(net: float) -> str:
    return "mostly positive" if net > 0.15 else "mostly negative" if net < -0.15 else "mixed"


def headline(net: float, issues: list, total: int) -> str:
    if total == 0:
        return "No feedback has been analysed yet. Upload comments to get started."
    text = f"Overall customer mood is {mood_word(net)}."
    top = [i for i in issues if i.priority >= 40][:2]
    if not top:
        return f"{text} No urgent problems were found."
    areas = " and ".join(dict.fromkeys(i.aspect.lower() for i in top))
    return f"{text} The most urgent problems are about {areas}. Start with those."


def recommendations(issues: list, requests: list) -> list[str]:
    out = [
        f"Look into “{i.title}”. It has {priority_level(i.priority)} urgency with {i.mentions} mention{'s' if i.mentions != 1 else ''}."
        for i in issues[:2]
    ]
    if requests:
        r = requests[0]
        out.append(f"Consider “{r.title}”, which {r.count} customer{'s' if r.count != 1 else ''} asked for.")
    return out or ["Upload feedback to see suggested next steps."]
