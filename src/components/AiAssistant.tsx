import React, { useState, useEffect } from 'react'

import { usePia } from '@/hooks/usePia'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'

export const AiAssistant: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  const { toast } = useToast()
  const { promptPia, response, isGenerating } = usePia()
  const [prompt, setPrompt] = useState('')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [promptHistory, setPromptHistory] = useState<string[]>([])

  useEffect(() => {
    if (response) {
      setGeneratedContent(response)
    }
  }, [response])

  const handlePromptPia = async () => {
    if (!prompt.trim()) return

    try {
      setGeneratedContent('')
      const previousPrompts =
        promptHistory.length > 0
          ? `PREVIOUS PROMPTS HERE SEPARATED BY NEW LINE: \n${promptHistory.join('\n')}. Based on this, `
          : ''
      const fullPrompt = `${previousPrompts}please ${prompt}\n\n`
      await promptPia(fullPrompt)
      setPromptHistory((prev) => [...prev, prompt])
      setPrompt('')
    } catch (error) {
      console.error('Error prompting PIA:', error)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(generatedContent)
      .then(() => {
        toast({
          title: 'Copied to clipboard',
          description:
            'The generated content has been copied to your clipboard',
        })
      })
      .catch((err) => {
        console.error('Failed to copy text: ', err)
      })
  }

  const handleReset = () => {
    setGeneratedContent('')
    setPromptHistory([])
    setPrompt('')
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" disabled={disabled}>
          PIA Assistant
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium">AI Assistant</h4>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            rows={3}
          />
          <div className="flex space-x-2">
            <Button onClick={handlePromptPia} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
            <Button onClick={handleReset} variant="secondary">
              Reset
            </Button>
          </div>
          {generatedContent && (
            <>
              <ScrollArea className="h-60 w-full rounded border p-2">
                <div className="whitespace-pre-wrap">{generatedContent}</div>
              </ScrollArea>
              <Button onClick={copyToClipboard}>Copy to Clipboard</Button>
            </>
          )}
          {promptHistory.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">Prompt History:</h5>
              <ScrollArea className="h-40 w-full rounded border p-2">
                {promptHistory.map((p, index) => (
                  <div key={index} className="mb-1">
                    {p}
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
