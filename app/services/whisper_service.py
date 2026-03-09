import os
import tempfile
from pathlib import Path

try:
    import whisper
    WHISPER_AVAILABLE = True
    _model = None

    def _get_model():
        global _model
        if _model is None:
            _model = whisper.load_model("base")
        return _model

except ImportError:
    WHISPER_AVAILABLE = False

SUPPORTED_FORMATS = {".wav", ".mp3", ".ogg", ".webm", ".m4a", ".flac"}


async def transcribe_audio(audio_bytes: bytes, filename: str = "audio.wav") -> dict:
    if not WHISPER_AVAILABLE:
        return {
            "success": False, "text": "", "language": None,
            "error": "Whisper not installed. Run: pip install openai-whisper",
        }

    suffix = Path(filename).suffix.lower()
    if suffix not in SUPPORTED_FORMATS:
        return {
            "success": False, "text": "", "language": None,
            "error": f"Unsupported format '{suffix}'.",
        }

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = _get_model()
        result = model.transcribe(tmp_path, fp16=False)
        return {
            "success": True,
            "text": result.get("text", "").strip(),
            "language": result.get("language"),
            "error": None,
        }
    except Exception as e:
        return {"success": False, "text": "", "language": None, "error": str(e)}
    finally:
        try:
            os.unlink(tmp_path)
        except OSError:
            pass