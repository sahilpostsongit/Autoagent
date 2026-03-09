import json
import io
from pathlib import Path
from langchain_core.tools import tool

try:
    import pandas as pd
    PANDAS_AVAILABLE = True
except ImportError:
    PANDAS_AVAILABLE = False

UPLOAD_DIR = Path.home() / "autoagent_uploads"
UPLOAD_DIR.mkdir(exist_ok=True)


@tool
def analyze_data(instruction: str) -> str:
    """
    Analyze data from an uploaded CSV or JSON file.
    Input format (JSON string):
    {
      "file": "filename.csv",
      "operation": "summary",
      "params": {}
    }
    Operations: summary, describe, head, filter, groupby, correlation
    """
    if not PANDAS_AVAILABLE:
        return "Error: pandas is not installed."

    try:
        params = json.loads(instruction)
    except json.JSONDecodeError:
        return "Error: instruction must be valid JSON."

    file_name = params.get("file", "")
    operation = params.get("operation", "summary")
    op_params = params.get("params", {})

    if not file_name:
        return "Error: 'file' key is required."

    file_path = UPLOAD_DIR / file_name
    if not file_path.exists():
        return f"Error: File '{file_name}' not found."

    try:
        if file_name.endswith(".csv"):
            df = pd.read_csv(file_path)
        elif file_name.endswith(".json"):
            df = pd.read_json(file_path)
        elif file_name.endswith((".xlsx", ".xls")):
            df = pd.read_excel(file_path)
        else:
            return "Error: Unsupported file type."
    except Exception as e:
        return f"Error loading file: {str(e)}"

    try:
        if operation == "summary":
            buf = io.StringIO()
            df.info(buf=buf)
            return (
                f"📊 Dataset Summary\n"
                f"Shape: {df.shape[0]} rows × {df.shape[1]} columns\n\n"
                f"Column Info:\n{buf.getvalue()}\n\n"
                f"Null Counts:\n{df.isnull().sum().to_string()}"
            )
        elif operation == "describe":
            return f"📈 Statistical Description:\n{df.describe(include='all').to_string()}"
        elif operation == "head":
            n = int(op_params.get("n", 5))
            return f"🔍 First {n} rows:\n{df.head(n).to_string()}"
        elif operation == "correlation":
            numeric_df = df.select_dtypes(include="number")
            if numeric_df.empty:
                return "Error: No numeric columns found."
            return f"🔗 Correlation Matrix:\n{numeric_df.corr().to_string()}"
        else:
            return f"Error: Unknown operation '{operation}'."
    except Exception as e:
        return f"Analysis error: {str(e)}"