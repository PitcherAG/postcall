import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import * as z from 'zod'
import { PitcherEventName } from '@pitcher/js-api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { usePitcher } from './PitcherProvider'
import { StarRating } from '@/components/ui/star-rating'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const formSchema = z
  .object({
    meetingName: z.string().min(1, 'Meeting name is required'),
    meetingStart: z.date(),
    meetingEnd: z.date(),
    notes: z.string().optional(),
    meetingRating: z.number().min(1).max(5),
    scheduleFollowUp: z.boolean(),
    followUpDate: z.date().optional(),
  })
  .refine((data) => (data.scheduleFollowUp ? !!data.followUpDate : true), {
    message: 'Follow-up date is required when scheduling a follow-up',
    path: ['followUpDate'],
  })

export const PostcallForm: React.FC = () => {
  const { api, uiApi, actionId } = usePitcher()
  const [showFollowUp, setShowFollowUp] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingName: '',
      meetingStart: new Date(),
      meetingEnd: new Date(),
      notes: '',
      meetingRating: 3,
      scheduleFollowUp: false,
      followUpDate: undefined,
    },
  })

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      return alert(JSON.stringify(values))
      try {
        uiApi.disablePostcallSubmit()

        const response = await axios.post(
          'https://connect.pitcher.com/api/actions/execute',
          {
            actionId,
            eventData: values,
          },
        )

        if (
          response.data.result &&
          Array.isArray(response.data.result) &&
          response.data.result.every((item: string) => item === 'OK')
        ) {
          console.log("Data.result is an array of 'OK' strings.")
          uiApi.toast({
            message: 'Postcall submitted.',
            type: 'success',
          })
          uiApi.completePostcall({ was_successfully_submitted: true })
        } else {
          console.error("Data is not an array of 'OK' strings.")
          uiApi.enablePostcallSubmit()
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        uiApi.enablePostcallSubmit()
      }
    },
    [uiApi, actionId],
  )

  useEffect(() => {
    const handleSubmit = () => {
      form.handleSubmit(onSubmit)()
    }

    api.on(PitcherEventName.SUBMIT_POSTCALL_CLICKED, handleSubmit)

    return () => {
      api.off(PitcherEventName.SUBMIT_POSTCALL_CLICKED, handleSubmit)
    }
  }, [api, form, onSubmit])

  return (
    <Form {...form}>
      <div className="sticky top-0 bg-background pb-3 justify-between flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex gap-1">
          <Button variant="destructive">Cancel meeting</Button>
          <Button variant="outline">Return to meeting</Button>
        </div>
        <div className="flex gap-1">
          <Button variant="outline">Save & submit later</Button>
          <Button onClick={form.handleSubmit(onSubmit)}>Submit</Button>
        </div>
      </div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="meetingName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting name</FormLabel>
              <FormControl>
                <Input placeholder="Enter meeting name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
          <FormField
            control={form.control}
            name="meetingStart"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Start</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meetingEnd"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>End</FormLabel>
                <FormControl>
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter meeting notes..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="meetingRating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rate the meeting</FormLabel>
              <FormControl>
                <StarRating
                  rating={field.value}
                  onRatingChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="scheduleFollowUp"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked)
                    setShowFollowUp(checked)
                  }}
                />
              </FormControl>
              <FormLabel>Schedule follow-up meeting</FormLabel>
            </FormItem>
          )}
        />
        {showFollowUp && (
          <FormField
            control={form.control}
            name="followUpDate"
            render={({ field }) => (
              <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
                <FormItem>
                  <FormLabel>Follow-up meeting date</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </div>
            )}
          />
        )}
      </form>
    </Form>
  )
}
