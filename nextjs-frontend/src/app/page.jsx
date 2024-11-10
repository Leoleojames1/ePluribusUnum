'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Paperclip, Mic, VolumeIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
]

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [text, setText] = useState('')
  const [sourceLang, setSourceLang] = useState('auto')
  const [targetLang, setTargetLang] = useState('en')
  const [result, setResult] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [useSTT, setUseSTT] = useState(false)
  const [useTTS, setUseTTS] = useState(false)
  const [conversation, setConversation] = useState([])
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const handleTranslate = async () => {
    try {
      setError(null)
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang, use_stt: useSTT, use_tts: useTTS }),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      const data = await response.json()
      setResult(data)
      setConversation(prev => [...prev, { original: text, translation: data.llm_translation }])
      if (useTTS && data.audioUrl) {
        const audio = new Audio(data.audioUrl)
        audio.play()
        setIsPlaying(true)
        audio.onended = () => setIsPlaying(false)
      }
    } catch (error) {
      console.error('Translation failed:', error)
      setError(error.message)
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setText(e.target.result)
      reader.readAsText(file)
    }
  }

  const handleRecord = async () => {
    setIsRecording(true)
    try {
      const response = await fetch('/api/speech-to-text', { method: 'POST' })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setText(data.text)
      setSourceLang(data.lang)
    } catch (error) {
      console.error('Speech recognition failed:', error)
      setError(error.message)
    }
    setIsRecording(false)
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent">
              ePluribusUnum
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Select value={sourceLang} onValueChange={setSourceLang}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Source Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={targetLang} onValueChange={setTargetLang}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Target Language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter text to translate"
                  className="flex-grow bg-background text-foreground border-input min-h-[100px]"
                />
                <div className="flex flex-row sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2">
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current.click()}
                    className="bg-background hover:bg-accent"
                    aria-label="Upload file"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-hidden="true"
                  />
                  {useSTT && (
                    <Button 
                      variant="outline"
                      onClick={handleRecord} 
                      disabled={isRecording}
                      className="bg-background hover:bg-accent"
                      aria-label={isRecording ? "Recording..." : "Start recording"}
                    >
                      <Mic className={`w-4 h-4 ${isRecording ? 'text-destructive' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
              <Button 
                onClick={handleTranslate} 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Translate
              </Button>
              {error && (
                <div className="p-2 bg-destructive/20 text-destructive rounded" role="alert">
                  Error: {error}
                </div>
              )}
              {result && (
                <div className="space-y-2 p-4 rounded-lg bg-accent/50">
                  <p className="text-foreground"><strong>Original ({result.source_lang}):</strong> {result.original}</p>
                  <p className="text-foreground"><strong>Traditional Translation ({result.target_lang}):</strong> {result.traditional_translation}</p>
                  <p className="text-foreground"><strong>LLM Translation ({result.target_lang}):</strong> {result.llm_translation}</p>
                  {useTTS && result.audioUrl && (
                    <Button 
                      variant="outline"
                      onClick={() => new Audio(result.audioUrl).play()} 
                      disabled={isPlaying}
                      className="bg-background hover:bg-accent"
                      aria-label={isPlaying ? "Playing audio" : "Play translation audio"}
                    >
                      <VolumeIcon className="w-4 h-4 mr-2" />
                      {isPlaying ? 'Playing...' : 'Play Translation'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="dark-mode" 
                    checked={theme === 'dark'} 
                    onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="dark-mode" className="text-foreground">Dark Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="stt" 
                    checked={useSTT} 
                    onCheckedChange={setUseSTT}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="stt" className="text-foreground">Use Speech-to-Text</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="tts" 
                    checked={useTTS} 
                    onCheckedChange={setUseTTS}
                    className="data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor="tts" className="text-foreground">Use Text-to-Speech</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Conversation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                {conversation.map((item, index) => (
                  <div key={index} className="p-2 bg-accent/20 rounded">
                    <p><strong>Original:</strong> {item.original}</p>
                    <p><strong>Translation:</strong> {item.translation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}