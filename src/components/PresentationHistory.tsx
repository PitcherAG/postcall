import { useEffect, useState, useCallback, memo, type FC } from 'react'
import { usePitcher } from '@/components/providers/PitcherProvider'
import { urlSafeFetchInChunks } from '@/util/network'
import HistoryItem from './PresentationHistoryItem'
import {
  CallPresentationHistory,
  CallPresentationHistoryMetadata,
  PresentationHistoryItem,
} from './PresentationHistory.types'

interface PresentationHistoryProps {
  onChange: (value: PresentationHistoryItem[]) => void
}

const PresentationHistory: FC<PresentationHistoryProps> = memo(
  ({ onChange }) => {
    const [presentationHistory, setPresentationHistory] = useState<
      PresentationHistoryItem[]
    >([])
    const { api } = usePitcher()

    useEffect(() => {
      const loadHistoryAndFetchThumbnails = async () => {
        const callData = localStorage.getItem('call')
        const call = callData ? JSON.parse(callData) : null

        if (call) {
          const history: CallPresentationHistory =
            call.presentationHistory || []
          const metadata: CallPresentationHistoryMetadata =
            call.presentationHistoryMetadata || {}

          const organizedHistory = organizeHistory(history, metadata)

          try {
            const fileIds = [
              ...new Set(
                organizedHistory
                  .filter((item) => item.type === 'file')
                  .map((item) => item.id),
              ),
            ]

            const filesResponse = (await urlSafeFetchInChunks(
              fileIds,
              (chunk) => api.getFiles?.({ id__in: chunk.join(',') }) as any,
            )) as Awaited<ReturnType<typeof api.getFiles>>['results']

            if (!filesResponse) {
              throw new Error('No files found')
            }
            const filesMap = new Map(
              filesResponse.map((file) => [file.id, file]),
            )

            const historyWithThumbnails = organizedHistory.map((item) => {
              if (item.type === 'file') {
                const file = filesMap.get(item.id)
                return {
                  ...item,
                  thumbnail: file?.thumbnail_url || undefined,
                  content_type: file?.content_type,
                  pages: item.pages?.map((page) => ({
                    file,
                    ...page,
                  })),
                }
              }
              return item
            })

            setPresentationHistory(historyWithThumbnails)
          } catch (error) {
            console.error('Error fetching file thumbnails:', error)
            setPresentationHistory(organizedHistory)
          }
        }
      }

      loadHistoryAndFetchThumbnails()
    }, [])

    useEffect(() => {
      onChange(presentationHistory)
    }, [presentationHistory, onChange])

    const organizeHistory = useCallback(
      (
        history: CallPresentationHistory,
        metadata: CallPresentationHistoryMetadata,
      ) => {
        const organizedHistory: PresentationHistoryItem[] = []
        const fileMap = new Map<string, PresentationHistoryItem>()
        const alreadyAddedItems = new Set<string>()

        history.forEach((item) => {
          const metadataKey =
            item.type === 'page' ? `${item.id}/${item.page}` : item.id
          const rating = metadata[metadataKey]?.rating

          if (!alreadyAddedItems.has(metadataKey)) {
            alreadyAddedItems.add(metadataKey)

            if (item.type === 'file') {
              if (!fileMap.has(item.id)) {
                fileMap.set(item.id, {
                  ...item,
                  pages: [],
                  rating,
                  enabled: true,
                })
              }
            } else if (item.type === 'page') {
              const fileId = item.id
              let file = fileMap.get(fileId)
              if (!file) {
                file = {
                  id: fileId,
                  type: 'file',
                  name: item.name,
                  pages: [],
                  enabled: true,
                }
                fileMap.set(fileId, file)
              }
              const pageId = `${fileId}/${item.page}`
              if (!file.pages!.some((p) => p.id === pageId)) {
                file.pages!.push({
                  ...item,
                  id: pageId,
                  pageIndex: item.page,
                  rating,
                  enabled: true,
                })
              }
            } else {
              organizedHistory.push({ ...item, rating, enabled: true })
            }
          }
        })

        // Add all files to organized history, regardless of whether they have pages
        fileMap.forEach((file) => {
          organizedHistory.push(file)
        })

        return organizedHistory
      },
      [],
    )

    const toggleItemEnabled = useCallback((id: string, pageIndex?: number) => {
      setPresentationHistory((prevHistory) => {
        const updatedHistory = prevHistory.map((item) => {
          if (item.id === id) {
            if (item.type === 'file' && item.pages) {
              return {
                ...item,
                enabled: !item.enabled,
                pages: item.pages.map((page) => ({
                  ...page,
                  enabled: !item.enabled,
                })),
              }
            } else if (pageIndex !== undefined && item.pages) {
              return {
                ...item,
                pages: item.pages.map((page) =>
                  page.pageIndex === pageIndex
                    ? { ...page, enabled: !page.enabled }
                    : page,
                ),
              }
            }
          }
          return item
        })
        return updatedHistory
      })
    }, [])

    const updateRating = useCallback(
      (id: string, pageIndex: number | undefined, rating: -1 | 0 | 1) => {
        setPresentationHistory((prevHistory) => {
          const updatedHistory = prevHistory.map((item) => {
            if (item.type === 'file' && item.pages) {
              if (pageIndex !== undefined) {
                return {
                  ...item,
                  pages: item.pages.map((page) =>
                    page.id === id ? { ...page, rating } : page,
                  ),
                }
              } else if (item.id === id) {
                return { ...item, rating }
              }
            } else if (item.id === id) {
              return { ...item, rating }
            }
            return item
          })
          return updatedHistory
        })

        // Update localStorage
        const callData = localStorage.getItem('call')
        if (callData) {
          const call = JSON.parse(callData)
          call.presentationHistoryMetadata = {
            ...call.presentationHistoryMetadata,
            [id]: { ...call.presentationHistoryMetadata?.[id], rating },
          }
          localStorage.setItem('call', JSON.stringify(call))
        }
      },
      [],
    )

    return (
      <div className="space-y-4">
        {presentationHistory.length ? (
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
  },
)

PresentationHistory.displayName = 'PresentationHistory'

export default PresentationHistory
