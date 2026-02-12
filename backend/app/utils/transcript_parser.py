import re


def parse_vtt(content: str) -> str:
    """Parse WebVTT content to plain text."""
    lines = content.splitlines()
    text_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        # Skip VTT headers and metadata
        if stripped.startswith("WEBVTT"):
            continue
        if stripped.startswith("Kind:") or stripped.startswith("Language:"):
            continue
        if stripped.startswith("NOTE"):
            continue
        # Skip timestamp lines
        if re.match(r"\d{2}:\d{2}[:\.]", stripped):
            continue
        # Skip blank lines
        if not stripped:
            continue
        # Skip sequence numbers (pure digits)
        if stripped.isdigit():
            continue
        # Strip inline VTT tags like <v Speaker>
        cleaned = re.sub(r"<[^>]+>", "", stripped)
        if cleaned:
            text_lines.append(cleaned)

    return "\n".join(text_lines)


def parse_srt(content: str) -> str:
    """Parse SRT subtitle content to plain text."""
    lines = content.splitlines()
    text_lines: list[str] = []

    for line in lines:
        stripped = line.strip()
        # Skip blank lines
        if not stripped:
            continue
        # Skip sequence numbers (pure digits)
        if stripped.isdigit():
            continue
        # Skip timestamp lines
        if re.match(r"\d{2}:\d{2}:\d{2}", stripped):
            continue
        text_lines.append(stripped)

    return "\n".join(text_lines)


def parse_transcript(content: str, filename: str) -> str:
    """Parse a transcript file to plain text based on file extension.

    Supports .vtt, .srt, and .txt formats.
    """
    lower = filename.lower()
    if lower.endswith(".vtt"):
        return parse_vtt(content)
    elif lower.endswith(".srt"):
        return parse_srt(content)
    else:
        # .txt or unknown — return as-is
        return content.strip()
