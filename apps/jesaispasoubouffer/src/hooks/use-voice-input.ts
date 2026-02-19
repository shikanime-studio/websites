import { fetchServerSentEvents } from '@tanstack/ai-react'
import { useRef, useState } from 'react'
import { voiceFn } from '../server/voice'

export function useVoiceInput() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  async function toggleRecording() {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone not available.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      audioChunksRef.current = []

      recorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()

        reader.onloadend = async () => {
          try {
            const result = reader.result
            const base64 = typeof result === 'string' ? result.split(',')[1] : ''
            if (!base64) {
              throw new Error('Failed to read audio.')
            }

            setIsTranscribing(true)
            setTranscript('')

            const adapter = fetchServerSentEvents(voiceFn.url, {
              body: {
                audio: base64,
                format: 'webm',
              },
            })

            const responseStream = adapter.connect([])
            let fullTranscript = ''

            for await (const chunk of responseStream) {
              if (chunk.type === 'TEXT_MESSAGE_CONTENT') {
                fullTranscript += chunk.delta
                setTranscript(fullTranscript)
              }
            }
          }
          catch {
            setError('Transcription failed.')
          }
          finally {
            setIsTranscribing(false)
            setIsRecording(false)
          }
        }

        reader.readAsDataURL(blob)
      }

      recorder.start()
      setIsRecording(true)
      setError(null)
    }
    catch {
      setError('Could not access microphone.')
      setIsRecording(false)
    }
  }

  return {
    isRecording: isRecording || isTranscribing, // Keep "recording" state active during transcription for UI simplicity
    isTranscribing,
    transcript,
    error,
    toggleRecording,
  }
}
