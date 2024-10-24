import { Button } from './button'
import { ScrollArea } from './scroll-area'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

interface TimePickerProps {
  value: string
  onChange: (time: string) => void
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const hours = [
    ...Array.from({ length: 17 }, (_, i) =>
      (i + 7).toString().padStart(2, '0'),
    ),
    ...Array.from({ length: 7 }, (_, i) => i.toString().padStart(2, '0')),
  ]
  const minutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0'),
  )

  const [selectedHour, selectedMinute] = value ? value.split(':') : ['07', '00']

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="form">{value || '07:00'}</Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        <div className="flex space-x-2">
          <ScrollArea className="h-72 w-16">
            {hours.map((hour) => (
              <Button
                key={hour}
                variant={hour === selectedHour ? 'default' : 'ghost'}
                className="w-full"
                onClick={() => onChange(`${hour}:${selectedMinute}`)}
              >
                {hour}
              </Button>
            ))}
          </ScrollArea>
          <ScrollArea className="h-72 w-16">
            {minutes.map((minute) => (
              <Button
                key={minute}
                variant={minute === selectedMinute ? 'default' : 'ghost'}
                className="w-full"
                onClick={() => onChange(`${selectedHour}:${minute}`)}
              >
                {minute}
              </Button>
            ))}
          </ScrollArea>
        </div>
      </PopoverContent>
    </Popover>
  )
}
