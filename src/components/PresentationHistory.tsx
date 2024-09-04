import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePitcher } from '@/components/providers/PitcherProvider'
import { urlSafeFetchInChunks } from '@/util/network'
import { Smile, Meh, Frown, Plus, Minus } from 'lucide-react'

export type CallPresentationHistory = {
  type: 'canvas' | 'section' | 'file' | 'page'
  notesContent?: string
  duration?: number
  timeStarted?: string
  name?: string
  id: string
}[]

export type CallPresentationHistoryMetadata = {
  [key: string]: {
    rating: -1 | 0 | 1
  }
}

export type PresentationHistoryItem = CallPresentationHistory[number] & {
  rating?: -1 | 0 | 1
  pageIndex?: number
  thumbnail?: string
  enabled: boolean
}

interface PresentationHistoryProps {
  value?: PresentationHistoryItem[]
  onChange: (value: PresentationHistoryItem[]) => void
}

const PresentationHistory: React.FC<PresentationHistoryProps> = ({
  onChange,
}) => {
  const [presentationHistory, setPresentationHistory] = useState<
    PresentationHistoryItem[]
  >([])
  const { api } = usePitcher()

  useEffect(() => {
    const loadHistoryAndFetchThumbnails = async () => {
      const callData = localStorage.getItem('call')
      const call = callData ? JSON.parse(callData) : null

      if (call) {
        const history: CallPresentationHistory = call.presentationHistory || []
        const metadata: CallPresentationHistoryMetadata =
          call.presentationHistoryMetadata || {}

        const combinedHistory = history.map((item) => {
          const [fileId, pageIndex] = item.id.split('/')
          const metadataKey =
            item.type === 'page' ? `${fileId}/${pageIndex}` : item.id
          return {
            ...item,
            rating: metadata[metadataKey]?.rating,
            pageIndex: pageIndex ? parseInt(pageIndex, 10) : undefined,
            enabled: true,
          }
        })

        const deduplicatedHistory = deduplicateHistory(combinedHistory)

        const fileIds = [
          ...deduplicatedHistory.reduce((acc, item) => {
            if (item.type === 'file' || item.type === 'page') {
              const fileId = item.id.split('/')[0]
              acc.add(fileId)
            }
            return acc
          }, new Set<string>()),
        ]

        try {
          const filesResponse = (await urlSafeFetchInChunks(
            fileIds,
            (chunk) => api.getFiles?.({ id__in: chunk.join(',') }) as any,
          )) as Awaited<ReturnType<typeof api.getFiles>>['results']

          if (!filesResponse) {
            throw new Error('No files found')
          }
          const filesMap = new Map(filesResponse.map((file) => [file.id, file]))

          const historyWithThumbnails = deduplicatedHistory.map((item) => {
            const fileId = item.id.split('/')[0]
            const file = filesMap.get(fileId)
            return {
              ...item,
              thumbnail: file?.thumbnail_url || undefined,
            }
          })

          setPresentationHistory(historyWithThumbnails)
          onChange(historyWithThumbnails)
        } catch (error) {
          console.error('Error fetching file thumbnails:', error)
          setPresentationHistory(deduplicatedHistory)
          onChange(deduplicatedHistory)
        }
      }
    }

    loadHistoryAndFetchThumbnails()
  }, [])

  const deduplicateHistory = (
    history: PresentationHistoryItem[],
  ): PresentationHistoryItem[] => {
    const uniqueMap = new Map<string, PresentationHistoryItem>()

    history.forEach((item) => {
      const key = `${item.id}${item.pageIndex !== undefined ? '/' + item.pageIndex : ''}`
      if (
        !uniqueMap.has(key) ||
        (item.timeStarted &&
          item.timeStarted > (uniqueMap.get(key)?.timeStarted ?? ''))
      ) {
        uniqueMap.set(key, item)
      }
    })

    return Array.from(uniqueMap.values())
  }

  const toggleItemEnabled = (id: string, pageIndex?: number) => {
    const updatedHistory = presentationHistory.map((item) =>
      item.id === id && item.pageIndex === pageIndex
        ? { ...item, enabled: !item.enabled }
        : item,
    )
    setPresentationHistory(updatedHistory)
    onChange(updatedHistory)
  }

  const updateRating = (
    id: string,
    pageIndex: number | undefined,
    rating: -1 | 0 | 1,
  ) => {
    const updatedHistory = presentationHistory.map((item) =>
      item.id === id && item.pageIndex === pageIndex
        ? { ...item, rating }
        : item,
    )
    setPresentationHistory(updatedHistory)
    onChange(updatedHistory)
  }

  return (
    <div className="space-y-4">
      {presentationHistory?.length ? (
        presentationHistory.map((item) => (
          <div
            key={item.id}
            className="border rounded-sm shadow-sm overflow-hidden"
          >
            <HistoryItem
              item={item}
              updateRating={updateRating}
              toggleItemEnabled={toggleItemEnabled}
            />
          </div>
        ))
      ) : (
        <span className="text-primary-3">
          Nothing was presented. Maybe cancel or resume the call?
        </span>
      )}
    </div>
  )
}

const HistoryItem: React.FC<{
  item: PresentationHistoryItem
  updateRating: (
    id: string,
    pageIndex: number | undefined,
    rating: -1 | 0 | 1,
  ) => void
  toggleItemEnabled: (id: string, pageIndex?: number) => void
}> = ({ item, updateRating, toggleItemEnabled }) => (
  <div className="flex items-center space-x-4 p-4 bg-primary-6">
    <div className={`flex-1 ${item.enabled ? '' : 'opacity-50'}`}>
      {item.thumbnail && (
        <img
          src={item.thumbnail}
          alt={item.name}
          className="w-16 h-16 object-cover rounded"
        />
      )}
      <h3 className="text-lg font-medium">
        {item.name || `${item.type} item`}
      </h3>
      <p className="text-sm text-gray-500">Type: {item.type}</p>
      {item.type === 'page' && item.pageIndex !== undefined && (
        <p className="text-sm text-gray-500">Page: {item.pageIndex + 1}</p>
      )}
      <RatingBadges
        item={item}
        updateRating={updateRating}
        disabled={!item.enabled}
      />
    </div>
    <ToggleButton item={item} toggleItemEnabled={toggleItemEnabled} />
  </div>
)

const RatingBadges: React.FC<{
  item: PresentationHistoryItem
  updateRating: (
    id: string,
    pageIndex: number | undefined,
    rating: -1 | 0 | 1,
  ) => void
  disabled: boolean
}> = ({ item, updateRating, disabled }) => (
  <div className="flex space-x-2 mt-2">
    <Badge
      className={`p-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      variant={item.rating === -1 ? 'destructive' : 'outline'}
      onClick={() => !disabled && updateRating(item.id, item.pageIndex, -1)}
    >
      <Frown size={28} />
    </Badge>
    <Badge
      className={`p-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      variant={item.rating === 0 ? 'secondary' : 'outline'}
      onClick={() => !disabled && updateRating(item.id, item.pageIndex, 0)}
    >
      <Meh size={28} />
    </Badge>
    <Badge
      className={`p-1 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      variant={item.rating === 1 ? 'default' : 'outline'}
      onClick={() => !disabled && updateRating(item.id, item.pageIndex, 1)}
    >
      <Smile size={28} />
    </Badge>
  </div>
)

const ToggleButton: React.FC<{
  item: PresentationHistoryItem
  toggleItemEnabled: (id: string, pageIndex?: number) => void
}> = ({ item, toggleItemEnabled }) => (
  <Button
    variant={item.enabled ? 'outline' : 'default'}
    className="rounded-full"
    size="icon"
    onClick={(e) => {
      e.preventDefault()
      toggleItemEnabled(item.id, item.pageIndex)
    }}
  >
    {item.enabled ? <Minus size={20} /> : <Plus size={20} />}
  </Button>
)

export default PresentationHistory
