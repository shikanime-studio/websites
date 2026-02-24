import { Mic } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useVoiceInput } from '../hooks/use-voice-input'

interface VoiceInputProps {
  query: string
  setQuery: (query: string) => void
}

export default function VoiceInput({ query, setQuery }: VoiceInputProps) {
  const { isRecording, isTranscribing, transcript, error, toggleRecording } = useVoiceInput()
  const [startQuery, setStartQuery] = useState('')
  const [activeSession, setActiveSession] = useState(false)

  // Sync activeSession with isRecording to handle auto-stop (e.g. error or silence)
  useEffect(() => {
    if (!isRecording && activeSession) {
      setActiveSession(false)
    }
  }, [isRecording, activeSession])

  const handleToggle = () => {
    if (!isRecording) {
      setStartQuery(query)
      setActiveSession(true)
    }
    toggleRecording()
  }

  useEffect(() => {
    if (activeSession && transcript) {
      setQuery((startQuery ? `${startQuery} ` : '') + transcript)
    }
  }, [transcript, activeSession, startQuery, setQuery])

  return (
    <div className="form-control w-full">
      <label className="input input-bordered flex items-center gap-2 w-full rounded-2xl h-14 bg-base-100 shadow-sm focus-within:shadow-md transition-shadow">
        <span className="text-sm font-semibold opacity-70">Envie de :</span>
        <input
          type="text"
          placeholder="japonais, pizza, burger..."
          className="grow font-medium placeholder:font-normal placeholder:opacity-50"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <button
          type="button"
          className={`btn btn-circle btn-sm border-none ${isRecording ? 'btn-error animate-pulse text-white' : 'btn-ghost text-neutral-500 hover:bg-base-200'}`}
          onClick={handleToggle}
          disabled={isTranscribing && !isRecording} // Disable only if processing but not recording/streaming
        >
          <Mic className="h-5 w-5" />
        </button>
      </label>
      {error && <span className="text-xs text-error mt-2 ml-2 font-medium">{error}</span>}
    </div>
  )
}
