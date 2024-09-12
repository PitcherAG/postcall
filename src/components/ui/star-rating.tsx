import React from 'react'
import FaIcon from '@/components/ui/fa-icon'
import { cn } from '@/util'
interface StarRatingProps {
  rating: number
  onRatingChange: (rating: number) => void
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
}) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <FaIcon
          key={star}
          type={star <= rating ? 'fas' : 'far'}
          icon="star"
          className={cn(
            'h-6 w-6 cursor-pointer',
            star <= rating ? 'text-primary' : 'text-primary-5',
          )}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  )
}
