from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from translate import Translator
import ollama
import speech_recognition as sr
# Comment out TTS import since we're not using it
# from TTS.api import TTS
import tempfile
import os
from langdetect import detect
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Create audio directory if it doesn't exist
AUDIO_DIR = "audio_files"
os.makedirs(AUDIO_DIR, exist_ok=True)

# Mount the audio directory
app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TranslationRequest(BaseModel):
    text: str
    target_lang: str
    source_lang: str = "auto"
    use_stt: bool = False
    # Remove TTS option since we're not using it
    # use_tts: bool = False

@app.post("/api/translate")
async def translate_text(request: TranslationRequest):
    try:
        logger.info(f"Received translation request: {request}")

        # Source language detection
        if request.source_lang == "auto":
            try:
                request.source_lang = detect(request.text)
                logger.info(f"Detected language: {request.source_lang}")
            except Exception as e:
                logger.error(f"Language detection failed: {str(e)}")
                raise HTTPException(status_code=400, detail=f"Language detection failed: {str(e)}")

        # Traditional translation
        try:
            translator = Translator(from_lang=request.source_lang, to_lang=request.target_lang)
            traditional_translation = translator.translate(request.text)
            logger.info("Traditional translation completed")
        except Exception as e:
            logger.error(f"Traditional translation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Traditional translation failed: {str(e)}")

        # LLM translation
        try:
            ollama_response = ollama.chat(
                model='mistral',
                messages=[{
                    'role': 'user',
                    'content': f"Translate this text from {request.source_lang} to {request.target_lang}: {request.text}"
                }],
            )
            llm_translation = ollama_response['message']['content']
            logger.info("LLM translation completed")
        except Exception as e:
            logger.error(f"LLM translation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"LLM translation failed: {str(e)}")

        response = {
            "original": request.text,
            "source_lang": request.source_lang,
            "target_lang": request.target_lang,
            "traditional_translation": traditional_translation,
            "llm_translation": llm_translation
        }

        # Remove TTS block since we're not using it
        
        logger.info("Successfully completed translation request")
        return response
        
    except Exception as e:
        logger.error(f"Unexpected error in translate_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech-to-text")
async def speech_to_text():
    logger.info("Starting speech-to-text conversion")
    
    try:
        # Initialize recognizer
        r = sr.Recognizer()
        
        # Attempt to find microphone
        try:
            sr.Microphone()
            logger.info("Microphone found successfully")
        except Exception as e:
            logger.error(f"Failed to initialize microphone: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to initialize microphone. Please check if a microphone is connected."
            )

        # Listen to audio
        with sr.Microphone() as source:
            logger.info("Listening for speech...")
            # Adjust for ambient noise
            r.adjust_for_ambient_noise(source, duration=0.5)
            audio = r.listen(source, timeout=5, phrase_time_limit=10)
            logger.info("Audio captured successfully")

        # Attempt speech recognition
        try:
            text = r.recognize_google(audio)
            logger.info(f"Speech recognition successful: {text}")
        except sr.UnknownValueError:
            logger.error("Google Speech Recognition could not understand audio")
            raise HTTPException(
                status_code=400,
                detail="Could not understand audio. Please speak clearly and try again."
            )
        except sr.RequestError as e:
            logger.error(f"Could not request results from Google Speech Recognition service: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Speech recognition service error: {str(e)}"
            )

        # Detect language
        try:
            detected_lang = detect(text)
            logger.info(f"Language detected: {detected_lang}")
        except Exception as e:
            logger.error(f"Language detection failed: {str(e)}")
            # Default to English if language detection fails
            detected_lang = "en"
            
        return {
            "text": text,
            "lang": detected_lang,
            "confidence": getattr(r, 'confidence', None)
        }
        
    except Exception as e:
        logger.error(f"Unexpected error in speech_to_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)