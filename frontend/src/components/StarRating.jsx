import { Star, StarHalf, StarOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const StarRating = ({ rating, reviewCount, className = '' }) => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const stars = 5

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[...Array(stars)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-500" />
        }
        if (i === fullStars && hasHalfStar) {
          return <StarHalf key={i} className="w-4 h-4 fill-emerald-400 text-emerald-500" />
        }
        return <StarOff key={i} className="w-4 h-4 text-slate-300" />
      })}
      {reviewCount > 0 && (
        <span className="text-sm text-slate-600 font-medium ml-1">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}

export default StarRating
