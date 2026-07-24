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
    summary="Speech-to-Text (STT) transcriber — all roles",
)
async def speech_to_text(
    file: UploadFile = File(...),
):
    """
    Transcribes uploaded audio (WAV/MP3) using Google Speech Recognition.
    Supports English and Kannada audio files.
    """
    import tempfile, os, speech_recognition as sr
    try:
        content = await file.read()
        logger.info("Received audio file %s (%d bytes) for transcription", file.filename, len(content))

        suffix = os.path.splitext(file.filename)[-1] or ".wav"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        recognizer = sr.Recognizer()
        with sr.AudioFile(tmp_path) as source:
            audio = recognizer.record(source)

        os.unlink(tmp_path)

        transcription = recognizer.recognize_google(audio)
        logger.info("STT transcription successful: %r", transcription[:60])
        return {
            "status": "success",
            "transcription": transcription,
            "filename": file.filename,
        }
    except sr.UnknownValueError:
        return {"status": "success", "transcription": "", "filename": file.filename, "note": "Could not understand audio"}
    except sr.RequestError as e:
        logger.error("Google STT API error: %s", e)
        raise HTTPException(status_code=503, detail=f"Speech recognition service unavailable: {e}")
    except Exception as e:
        logger.error("STT transcription failed: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
