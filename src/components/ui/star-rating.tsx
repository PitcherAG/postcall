import React from 'react'
import { Star } from 'lucide-react'

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
        <Star
          key={star}
          className={`h-6 w-6 cursor-pointer ${
            star <= rating ? 'text-primary fill-primary' : 'text-primary-5'
          }`}
          onClick={() => onRatingChange(star)}
        />
      ))}
    </div>
  )
}
