import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react'
import {
  usePitcherApi as getApi,
  useUi as getUiApi,
  UI_MESSAGE_TYPES,
  UiMeetingCanceledPayload,
  type PitcherEnv,
} from '@pitcher/js-api'

interface PitcherContextType {
  api: ReturnType<typeof getApi>
  uiApi: ReturnType<typeof getUiApi>
  env: PitcherEnv | null
  endpoint: string | null
}

export const PitcherContext = createContext<PitcherContextType | undefined>(
  undefined,
)

// eslint-disable-next-line react-refresh/only-export-components
export const usePitcher = () => {
  const context = useContext(PitcherContext)
  if (!context) {
    throw new Error('usePitcher must be used within a PitcherProvider')
  }
  return context
}

export const PitcherProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const apiRef = useRef(getApi())
  const uiApiRef = useRef(getUiApi())
  const [env, setEnv] = useState<PitcherEnv | null>(null)
  const [endpoint, setEndpoint] = useState<string | null>(null)

  useEffect(() => {
    const api = apiRef.current
    const uiApi = uiApiRef.current
    const handleMeetingCanceled = async (p: UiMeetingCanceledPayload) => {
      console.log('Meeting canceled', p)
      uiApi.completePostcall({ was_successfully_submitted: false })
    }

    const fetchDataAndSubscribe = async () => {
      await Promise.allSettled([
        api
          .getAppConfig({ app_name: VITE_APP_NAME })
          .then((r) => setEndpoint(r.postcall_submit_endpoint)),
        api.getEnv().then((env) => {
          const primaryColor = env?.pitcher?.instance?.color

          primaryColor &&
            ['--primary', '--ring', '--chart-5'].forEach((p) =>
              document.documentElement.style.setProperty(p, primaryColor),
            )

          setEnv(env)
        }),
        api.subscribe(),
      ])

      return uiApi.on(
        UI_MESSAGE_TYPES.UI_MEETING_CANCELED,
        handleMeetingCanceled,
      )
    }

    const cleanup = fetchDataAndSubscribe()

    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.())
      api.unsubscribe()
    }
  }, [])

  return (
    <PitcherContext.Provider
      value={{ api: apiRef.current, uiApi: uiApiRef.current, env, endpoint }}
    >
      {children}
    </PitcherContext.Provider>
  )
}
