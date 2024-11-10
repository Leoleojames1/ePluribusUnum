# ePluribusUnum: Universal Speech-to-Speech Translation Platform

## Overview
ePluribusUnum is a comprehensive translation platform that enables seamless speech-to-speech and document-to-document translation, with a specific focus on Ukrainian to Dutch (and vice versa) translation. The platform combines traditional translation methods with advanced LLM capabilities to provide accurate and context-aware translations.

## Features
- 🎙️ Speech-to-Speech Translation
- 📄 Document Text Translation
- 🔄 Bidirectional Translation (Ukrainian ↔ Dutch)
- 🤖 LLM-powered Context-aware Translation
- 🔊 Text-to-Speech Synthesis
- 📝 Conversation History
- 🌓 Dark/Light Mode Support
- 📱 Responsive Design

## Tech Stack
### Frontend (Next.js)
- Next.js 13+ with App Router
- React
- Tailwind CSS
- shadcn/ui Components
- next-themes for Dark Mode

### Backend (FastAPI)
- FastAPI
- Ollama for LLM Integration
- Speech Recognition
- TTS (Text-to-Speech)
- Language Detection

## Prerequisites
- Python 3.8+
- Node.js 18+
- Ollama with llama3.1 model
- GPU support for TTS (optional but recommended)

## Installation

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/ePluribusUnum.git
cd ePluribusUnum/pyBackend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the backend server
python ollamaAgent.py
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../nextjs-frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables
Create a `.env` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Usage
1. Access the application at `http://localhost:3000`
2. Select source and target languages (Ukrainian/Dutch)
3. Choose input method:
   - Speak directly using the microphone
   - Upload a text document
   - Type text directly
4. Click "Translate" to process
5. View/play the translation result
6. Access conversation history in the sidebar

## Project Structure
```
ePluribusUnum/
├── pyBackend/
│   ├── ollamaAgent.py
│   ├── requirements.txt
│   └── audio_files/
├── nextjs-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   └── page.jsx
│   │   └── components/
│   ├── public/
│   └── package.json
└── README.md
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Ollama for LLM capabilities
- Coqui TTS for speech synthesis
- Google Speech Recognition for STT
- shadcn/ui for the component library

## Contact
For questions and support, please open an issue in the GitHub repository.