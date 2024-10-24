import React from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from '@radix-ui/react-icons'
import { cn } from '@/util'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { TimePicker } from '@/components/ui/time-picker'

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date) => void
}

export function DateTimePicker({ value, onChange }: DateTimePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(value)
  const [time, setTime] = React.useState(() => {
    // Ensure the initial value is valid before formatting
    return value && !isNaN(value.getTime()) ? format(value, 'HH:mm') : '00:00'
  })
  const [open, setOpen] = React.useState(false)

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const [hours, minutes] = time.split(':').map(Number)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      setDate(newDate)
      onChange(newDate)
      setOpen(false)
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (date) {
      const [hours, minutes] = newTime.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours)
      newDate.setMinutes(minutes)
      onChange(newDate)
    }
  }

  return (
    <div className="flex space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={'form'}
            className={cn(
              'w-[280px] justify-start text-left font-normal px-2',
              !date && 'text-muted-foreground',
            )}
          >
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={handleDateChange} />
        </PopoverContent>
      </Popover>
      <TimePicker value={time} onChange={handleTimeChange} />
    </div>
  )
}
