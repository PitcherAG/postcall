import React, { useState, useCallback, memo } from 'react'
import { Button } from '@/components/ui/button'
import FaIcon from '@/components/ui/fa-icon'
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

    return (
      <div className="flex flex-col bg-primary-6">
        <div className="flex items-center space-x-4 p-4">
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
              <p className="text-sm text-gray-500">
                Page: {item.pageIndex + 1}
              </p>
            )}
            {hasPages && (
              <p className="text-sm text-gray-500">
                Pages: {item.pages!.length}
              </p>
            )}
            {!hasPages && (
              <RatingBadges
                item={item}
                updateRating={updateRating}
                disabled={!item.enabled}
              />
            )}
          </div>
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
            <ToggleButton item={item} toggleItemEnabled={handleToggleEnabled} />
          )}
        </div>
        {hasPages && expanded && (
          <div className="pl-8 pr-4 pb-4">
            {item.pages!.map((page) => (
              <div key={page.id} className="mt-2 border-t pt-2">
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
  <div className="flex space-x-2 mt-2">
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
        type="fas"
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
