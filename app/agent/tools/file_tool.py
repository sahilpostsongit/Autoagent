import json
from pathlib import Path
from langchain_core.tools import tool

WORKSPACE = Path.home() / "autoagent_workspace"
WORKSPACE.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".txt", ".md", ".json", ".csv", ".py", ".html", ".yaml", ".yml"}
MAX_FILE_SIZE = 1024 * 1024


def _validate_path(filename: str) -> Path:
    safe_path = (WORKSPACE / filename).resolve()
    if not str(safe_path).startswith(str(WORKSPACE)):
        raise ValueError("Access outside workspace is not allowed.")
    return safe_path


@tool
def file_tool(instruction: str) -> str:
    """
    Read, write, list, or delete files in the agent workspace.
    Input format (JSON string):
    {
      "action": "read",
      "filename": "notes.txt",
      "content": "..."
    }
    Actions: list, read, write, append, delete
    """
    try:
        params = json.loads(instruction)
    except json.JSONDecodeError:
        return "Error: instruction must be valid JSON."

    action = params.get("action", "list")
    filename = params.get("filename", "")
    content = params.get("content", "")

    try:
        if action == "list":
            files = list(WORKSPACE.iterdir())
            if not files:
                return "Workspace is empty."
            return "📁 Workspace files:\n" + "\n".join(
                f"  📄 {f.name} ({f.stat().st_size:,} bytes)" for f in sorted(files)
            )

        if not filename:
            return "Error: 'filename' is required."

        suffix = Path(filename).suffix.lower()
        if suffix not in ALLOWED_EXTENSIONS:
            return f"Error: Extension '{suffix}' not allowed."

        file_path = _validate_path(filename)

        if action == "read":
            if not file_path.exists():
                return f"Error: File '{filename}' does not exist."
            return f"📄 Contents of '{filename}':\n\n{file_path.read_text(encoding='utf-8')}"

        elif action == "write":
            if not content:
                return "Error: 'content' is required for write."
            file_path.write_text(content, encoding="utf-8")
            return f"✅ File '{filename}' written ({len(content):,} characters)."

        elif action == "append":
            if not content:
                return "Error: 'content' is required for append."
            with open(file_path, "a", encoding="utf-8") as f:
                f.write(content)
            return f"✅ Appended to '{filename}'."

        elif action == "delete":
            if not file_path.exists():
                return f"Error: File '{filename}' does not exist."
            file_path.unlink()
            return f"🗑️ File '{filename}' deleted."

        else:
            return f"Error: Unknown action '{action}'."

    except ValueError as e:
        return f"Security error: {str(e)}"
    except Exception as e:
        return f"File operation failed: {str(e)}"