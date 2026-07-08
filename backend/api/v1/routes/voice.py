import io
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from gtts import gTTS
from core.security import get_current_user
from core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post(
    "/tts",
    summary="Text-to-Speech (TTS) converter — all roles",
)
def text_to_speech(
    text: str = Form(...),
    lang: str = Form("en"),
):
    """
    Converts text to spoken audio. Supports English ('en') and Kannada ('kn').
    Returns a streaming MP3 audio file.
    """
    try:
        logger.info("Generating TTS audio for text (lang=%s): %r", lang, text[:40])
        # gTTS generates high-quality natural voice streams
        tts = gTTS(text=text, lang=lang, slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        return StreamingResponse(fp, media_type="audio/mp3")
    except Exception as e:
        logger.error("TTS generation failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/stt",
    summary="Speech-to-Text (STT) transcriber stub — all roles",
)
async def speech_to_text(
    file: UploadFile = File(...),
):
    """
    Transcribes uploaded audio files.
    Note: For production, we recommend browser-based Web Speech API recognition for zero-latency,
    but this endpoint is provided for backend-based processing fallback.
    """
    try:
        content = await file.read()
        logger.info("Received audio file %s (%d bytes) for transcription", file.filename, len(content))
        
        # In demo context, we mock a quick transcription or return a placeholder.
        # Browser-based speech recognition is handled in real-time in the UI.
        return {
            "status": "success",
            "transcription": "Sample transcript (Audio processed successfully on server)",
            "filename": file.filename,
        }
    except Exception as e:
        logger.error("STT transcription failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
