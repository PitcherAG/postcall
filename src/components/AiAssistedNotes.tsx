import React, { useState, useEffect, useRef } from 'react'
import { usePia } from '@/hooks/usePia'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface AiAssistedNotesProps {
  onNotesGeneration: (notes: string) => void
  currentNotes: string
}

export const AiAssistedNotes: React.FC<AiAssistedNotesProps> = ({
  onNotesGeneration,
  currentNotes,
}) => {
  const { promptPia, response } = usePia()
  const [isGenerating, setIsGenerating] = useState(false)
  const [notes, setNotes] = useState(currentNotes)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (response) {
      setNotes(response)
      setIsGenerating(false)
      onNotesGeneration(response)
    }
  }, [response, onNotesGeneration])

  useEffect(() => {
    adjustTextareaHeight()
  }, [notes])

  const handlePromptPia = async () => {
    try {
      setIsGenerating(true)
      await promptPia(
        'Generate concise meeting notes for my call based on my call object: ' +
          localStorage.getItem('call') +
          ' and my saved notes: ' +
          localStorage.getItem('notes_app_content') +
          '. Make sure to REMOVE any irrelevant properties. Calculate and include the call duration in a human-readable form (e.g., "30 minutes", "1 hour 15 minutes") using the call.eventDate object.',
      )
    } catch (error) {
      console.error('Error prompting PIA:', error)
      setIsGenerating(false)
    }
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
    onNotesGeneration(e.target.value)
    adjustTextareaHeight()
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        placeholder="Enter meeting notes..."
        value={notes}
        onChange={handleNotesChange}
        className="w-full pr-24 min-h-[100px] resize-none overflow-hidden"
        disabled={isGenerating}
      />
      <Button
        onClick={handlePromptPia}
        disabled={isGenerating}
        variant="outline"
        className="absolute top-2 right-2"
      >
        {isGenerating ? 'Generating..' : 'PIA Autofill'}
      </Button>
    </div>
  )
}
