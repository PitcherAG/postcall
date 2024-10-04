import React, { useState, useCallback, memo, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import FaIcon from '@/components/ui/fa-icon'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/util'
import { PresentationHistoryItem } from './PresentationHistory.types'

interface HistoryItemProps {
  item: PresentationHistoryItem
  updateRating: (
    id: string,
    pageIndex: number | undefined,
    rating: -1 | 0 | 1,
  ) => void
  toggleItemEnabled: (id: string, pageIndex?: number) => void
  isNested?: boolean
}

const HistoryItemType: React.FC<Pick<HistoryItemProps, 'item'>> = memo(
  ({ item }) => {
    return (
      <div className="font-thin text-sm text-gray-500">
        File: {item.file.name}
      </div>
    )
  },
)

const HistoryItem: React.FC<HistoryItemProps> = memo(
  ({ item, updateRating, toggleItemEnabled, isNested = false }) => {
    const [expanded, setExpanded] = useState(false)

    const handleToggleEnabled = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault()
        toggleItemEnabled(item.id, item.pageIndex)
      },
      [item.id, item.pageIndex, toggleItemEnabled],
    )

    const hasPages = item.type === 'file' && item.pages && item.pages.length > 0

    // Helper function to calculate aggregate rating
    const aggregateRating = useMemo(() => {
      if (!hasPages || !item.pages) return 0
      const sum = item.pages.reduce(
        (acc, page) => acc + parseInt(`${page.rating ?? '0'}`, 10),
        0,
      )
      const average = sum / item.pages.length
      return Math.round(average)
    }, [hasPages, item.pages])

    // Determine icon and label based on aggregate rating
    const getAggregateRatingDetails = (rating: number) => {
      if (rating <= -1) {
        return {
          icon: 'face-frown',
          label: 'Dissatisfied',
          color: 'text-error',
        }
      } else if (rating === 0) {
        return {
          icon: 'face-meh-blank',
          label: 'Neutral',
          color: 'text-primary-2',
        }
      } else {
        return {
          icon: 'face-grin-stars',
          label: 'Excited',
          color: 'text-primary',
        }
      }
    }

    const { icon, label, color } = getAggregateRatingDetails(aggregateRating)

    return (
      <div className={cn('flex flex-col')}>
        <div className="flex items-center space-x-4 p-4">
          <div
            className={`flex items-center justify-between w-full ${item.enabled ? '' : 'opacity-50'}`}
          >
            <div className="flex gap-2 items-center">
              {item.thumbnail && (
                <img
                  src={item.thumbnail}
                  alt={item.name}
                  className="w-16 h-auto rounded border border-gray-200"
                />
              )}
              <div className="flex flex-col gap-1">
                <div className="text-lg font-medium">
                  {item.type === 'page' && item.pageIndex !== undefined
                    ? `Page ${item.pageIndex + 1}`
                    : item.name || `${item.type} item`}
                </div>
                {item.type !== 'page' && (
                  <div className="text-sm text-gray-500">
                    {item.content_type && (
                      <>
                        <FaIcon
                          icon={
                            {
                              ar: 'ar',
                              font: 'font',
                              image: 'image',
                              pdf: 'file-pdf',
                              video: 'file-video',
                              web: 'globe',
                            }[item.content_type] || 'file'
                          }
                        />
                        <span className="ml-1 capitalize">
                          {item.content_type.toUpperCase()}
                        </span>
                      </>
                    )}
                  </div>
                )}
                {item.type === 'file' && !!item.pages?.length && (
                  <div>
                    <Badge variant="outline" className="gap-2">
                      <FaIcon icon={icon} className={color} />
                      {label}
                    </Badge>
                  </div>
                )}
                {item.type === 'page' && item.pageIndex !== undefined && (
                  <HistoryItemType item={item} />
                )}
                {hasPages && (
                  <div className="font-semibold text-gray-500">
                    {item.pages!.length} pages presented
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            {!hasPages && (
              <RatingBadges
                item={item}
                updateRating={updateRating}
                disabled={!item.enabled}
              />
            )}
            <div
              className={cn('flex justify-end', {
                'gap-2 min-w-[80px]': !isNested,
                'mr-[80px]': isNested,
              })}
            >
              {hasPages && (
                <Button
                  variant="outline"
                  className="rounded-full"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault()
                    setExpanded((prev) => !prev)
                  }}
                >
                  <FaIcon icon="grid-2" type="fas" />
                </Button>
              )}
              {!isNested && (
                <ToggleButton
                  item={item}
                  toggleItemEnabled={handleToggleEnabled}
                />
              )}
            </div>
          </div>
        </div>

        {hasPages && expanded && (
          <div className="">
            {item.pages!.map((page) => (
              <div key={page.id} className="border-t">
                <HistoryItem
                  isNested
                  item={page}
                  updateRating={updateRating}
                  toggleItemEnabled={toggleItemEnabled}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  },
)

HistoryItem.displayName = 'HistoryItem'

const RatingBadges = memo<{
  item: PresentationHistoryItem
  updateRating: (
    id: string,
    pageIndex: number | undefined,
    rating: -1 | 0 | 1,
  ) => void
  disabled: boolean
}>(({ item, updateRating, disabled }) => (
  <div className="flex space-x-2">
    {[-1, 0, 1].map((rating) => (
      <FaIcon
        key={rating}
        onClick={() =>
          !disabled &&
          updateRating(item.id, item.pageIndex, rating as -1 | 0 | 1)
        }
        icon={
          rating === -1
            ? 'face-frown'
            : rating === 0
              ? 'face-meh-blank'
              : 'face-grin-stars'
        }
        size="2x"
        className={cn(
          'p-1',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer',
          item.rating === rating
            ? rating === -1
              ? 'text-error'
              : rating === 0
                ? 'text-primary-2'
                : 'text-primary'
            : 'text-primary-4',
        )}
      />
    ))}
  </div>
))

RatingBadges.displayName = 'RatingBadges'

const ToggleButton = memo<{
  item: PresentationHistoryItem
  toggleItemEnabled: (e: React.MouseEvent) => void
}>(({ item, toggleItemEnabled }) => (
  <Button
    variant={item.enabled ? 'outline' : 'default'}
    className="rounded-full"
    size="icon"
    onClick={toggleItemEnabled}
  >
    <FaIcon icon={item.enabled ? 'minus' : 'plus'} type="fas" size="lg" />
  </Button>
))

ToggleButton.displayName = 'ToggleButton'

export default HistoryItem
