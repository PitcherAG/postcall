import React, { useCallback, useState, useEffect } from 'react'
import axios from 'axios'
import * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { usePitcher } from '@/components/providers/PitcherProvider'
import { AiAssistedNotes } from '@/components/AiAssistedNotes'
import { AiAssistant } from '@/components/AiAssistant'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { StarRating } from '@/components/ui/star-rating'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import PresentationHistory from '@/components/PresentationHistory'

const formSchema = z
  .object({
    meetingName: z.string().min(1, 'Meeting name is required'),
    meetingStart: z.date(),
    meetingEnd: z.date(),
    notes: z.string().optional(),
    meetingRating: z.number().min(1).max(5),
    scheduleFollowUp: z.boolean(),
    followUpDate: z.date().optional(),
    presentedContent: z.any().optional(),
  })
  .refine((data) => (data.scheduleFollowUp ? !!data.followUpDate : true), {
    message: 'Follow-up date is required when scheduling a follow-up',
    path: ['followUpDate'],
  })

export const PostcallForm: React.FC = () => {
  const { uiApi, api: impactApi, endpoint, env } = usePitcher()
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [actionId, setActionId] = useState('')

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      meetingName: (() => {
        try {
          const callData = JSON.parse(localStorage.call)
          return `Meeting with: ${callData.selectedAccount.Name}`
        } catch (error) {
          console.warn('Error parsing localStorage.call:', error)
          return ''
        }
      })(),
      meetingStart: new Date(),
      meetingEnd: new Date(),
      notes: '',
      meetingRating: 3,
      scheduleFollowUp: false,
      followUpDate: undefined,
    },
  })

  useEffect(() => {
    const fetchAppConfig = async () => {
      try {
        const config = await impactApi.getAppConfig({
          app_name: 'salesforceadmin',
        })
        setActionId(config?.postcall_submit_actionid || '')
      } catch (error) {
        console.error('Error fetching app config:', error)
      }
    }

    fetchAppConfig()
  }, [])

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      setIsSubmitting(true)
      try {
        const connectedServices = env?.pitcher?.user?.connected_services
        const sfdc = connectedServices?.[0]
        const salesforceToken = sfdc?.access_token
        const salesforceDomain = sfdc?.urls?.custom_domain
        if (actionId && salesforceToken && salesforceDomain) {
          let eventId = ''
          let callObject = null

          if (localStorage.call) {
            try {
              callObject = JSON.parse(localStorage.call)
              eventId = callObject?.selectedEvent?.Id || ''
            } catch (e) {
              console.warn('Error getting eventId from call object:', e)
            }
          }
          const eventData = {
            salesforceToken,
            salesforceDomain,
            eventId,
            callObject,
            ...values,
          }

          const response = await axios.post(
            'https://connect.pitcher.com/api/actions/execute',
            {
              actionId,
              eventData,
            },
          )

          if (
            response.data.result &&
            Array.isArray(response.data.result) &&
            response.data.result.every((item: string) => item === 'OK')
          ) {
            uiApi.toast({
              message: 'Postcall submitted.',
              type: 'success',
            })
            uiApi.completePostcall({ was_successfully_submitted: true })
          } else {
            throw new Error('Unexpected response from server')
          }
        } else {
          // Fallback to current submit strategy
          const accessToken = env?.pitcher.access_token
          if (!endpoint || !accessToken) {
            throw new Error('No endpoint or access token found to submit form')
          }
          await axios.post(endpoint, values, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          })

          uiApi.toast({
            message: 'Postcall submitted.',
            type: 'success',
          })
          uiApi.completePostcall({ was_successfully_submitted: true })
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        uiApi.toast({
          message: 'Error submitting postcall.',
          type: 'error',
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [uiApi, endpoint, env, actionId],
  )

  const cancelMeeting = () => {
    if (window.confirm('Are you sure you want to cancel the meeting?'))
      uiApi.cancelMeeting()
  }

  const resumeMeeting = () => {
    uiApi.resumeMeeting()
  }

  return (
    <Form {...form}>
      <div>
        <div className="sticky top-0 bg-background pb-3 justify-between flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0 z-10">
          <div className="flex gap-1">
            <Button
              variant="destructive"
              disabled={isSubmitting}
              onClick={cancelMeeting}
            >
              Cancel meeting
            </Button>
            <Button
              variant="outline"
              disabled={isSubmitting}
              onClick={resumeMeeting}
            >
              Return to meeting
            </Button>
          </div>
          <div className="flex gap-1">
            <AiAssistant disabled={isSubmitting} />
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
        <form className="space-y-8 pb-10">
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
            name="presentedContent"
            render={({ field }) => (
              <FormItem>
                <FormLabel>What was presented</FormLabel>
                <FormControl>
                  <PresentationHistory onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <AiAssistedNotes
                    onNotesGeneration={(notes) => form.setValue('notes', notes)}
                    currentNotes={field.value ?? ''}
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
      </div>
    </Form>
  )
}
