from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from translate import Translator
import ollama
import speech_recognition as sr
from TTS.api import TTS
import tempfile
import os
from langdetect import detect

app = FastAPI()

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
    use_tts: bool = False

@app.post("/api/translate")
async def translate_text(request: TranslationRequest):
    try:
        if request.source_lang == "auto":
            request.source_lang = detect(request.text)
        
        translator = Translator(from_lang=request.source_lang, to_lang=request.target_lang)
        traditional_translation = translator.translate(request.text)
        
        ollama_response = ollama.chat(
            model='llama3.1',
            messages=[{'role': 'user', 'content': f"Translate '{request.text}' from {request.source_lang} to {request.target_lang}"}],
        )
        
        llm_translation = ollama_response['message']['content']
        
        response = {
            "original": request.text,
            "source_lang": request.source_lang,
            "target_lang": request.target_lang,
            "traditional_translation": traditional_translation,
            "llm_translation": llm_translation
        }

        if request.use_tts:
            tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_file:
                tts.tts_to_file(text=llm_translation,
                                file_path=temp_file.name,
                                speaker="Ana Florence",
                                language=request.target_lang,
                                split_sentences=True)
                response["audioUrl"] = f"/audio/{os.path.basename(temp_file.name)}"

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/speech-to-text")
async def speech_to_text():
    try:
        r = sr.Recognizer()
        with sr.Microphone() as source:
            print("Listening...")
            audio = r.listen(source)
        
        text = r.recognize_google(audio)
        return {"text": text, "lang": detect(text)}
    except sr.UnknownValueError:
        raise HTTPException(status_code=400, detail="Could not understand audio")
    except sr.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Could not request results; {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)