import io
import traceback
from contextlib import redirect_stdout, redirect_stderr
from langchain_core.tools import tool

BLOCKED = {
    "__import__", "open", "exec", "eval", "compile",
    "breakpoint", "input", "memoryview",
}

SAFE_BUILTINS = {
    k: v for k, v in __builtins__.items()
    if k not in BLOCKED
} if isinstance(__builtins__, dict) else {
    k: getattr(__builtins__, k)
    for k in dir(__builtins__)
    if k not in BLOCKED
}

SAFE_GLOBALS = {
    "__builtins__": SAFE_BUILTINS,
    "print": print,
    "sum": sum, "min": min, "max": max, "abs": abs,
    "round": round, "range": range, "len": len,
    "enumerate": enumerate, "zip": zip, "map": map,
    "filter": filter, "sorted": sorted, "reversed": reversed,
    "list": list, "dict": dict, "set": set, "tuple": tuple,
    "str": str, "int": int, "float": float, "bool": bool,
}

try:
    import math
    SAFE_GLOBALS["math"] = math
except ImportError:
    pass

try:
    import json
    SAFE_GLOBALS["json"] = json
except ImportError:
    pass

try:
    import statistics
    SAFE_GLOBALS["statistics"] = statistics
except ImportError:
    pass


@tool
def execute_code(code: str) -> str:
    """
    Execute Python code in a sandboxed environment.
    Use for calculations, data processing, logic, string manipulation.
    Available modules: math, json, statistics.
    Input: Valid Python code as a string.
    Output: stdout output or result of last expression.
    """
    if len(code) > 5000:
        return "Error: Code too long (max 5000 characters)."

    dangerous_patterns = [
        "import os", "import sys", "import subprocess",
        "import socket", "import requests", "import urllib",
        "__import__", "open(", "exec(", "eval(",
    ]
    for pattern in dangerous_patterns:
        if pattern in code:
            return f"Error: Blocked pattern detected — '{pattern}' is not allowed."

    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    local_vars = {}

    try:
        with redirect_stdout(stdout_capture), redirect_stderr(stderr_capture):
            exec(code, SAFE_GLOBALS.copy(), local_vars)

        output = stdout_capture.getvalue()
        errors = stderr_capture.getvalue()
        result_parts = []

        if output:
            result_parts.append(f"Output:\n{output}")
        if errors:
            result_parts.append(f"Stderr:\n{errors}")
        if not output and local_vars:
            last_key = list(local_vars.keys())[-1]
            result_parts.append(f"Last variable '{last_key}' = {local_vars[last_key]}")

        return "\n".join(result_parts) if result_parts else "Code executed successfully (no output)."

    except Exception:
        tb = traceback.format_exc(limit=3)
        return f"Execution error:\n{tb}"