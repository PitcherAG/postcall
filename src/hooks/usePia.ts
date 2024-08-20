import { useState, useCallback, useEffect } from 'react'
import { usePitcher } from '@/components/providers/PitcherProvider'
import { UI_MESSAGE_TYPES } from '@pitcher/js-api'

type Subscriber = (response: string) => void

const subscribers = new Map<string, Subscriber>()

let isListenerRegistered = false

export function usePia() {
  const { uiApi } = usePitcher()
  const [response, setResponse] = useState('')

  useEffect(() => {
    if (!isListenerRegistered) {
      uiApi.on(
        UI_MESSAGE_TYPES.UI_PROMPT_PIA_RESPONSE_STREAMED,
        async (data) => {
          const subscriber = subscribers.get(data.id)
          if (subscriber) {
            subscriber(data.partial_response)
          }
        },
      )
      isListenerRegistered = true
    }
  }, [uiApi])

  const promptPia = useCallback(
    async (prompt: string) => {
      setResponse('')
      const id = Math.random().toString(36).slice(2, 9)
      subscribers.set(id, setResponse)
      try {
        await uiApi.promptPia({ prompt, id })
      } finally {
        subscribers.delete(id)
      }
    },
    [uiApi],
  )

  return { promptPia, response }
}
