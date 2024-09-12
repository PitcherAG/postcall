export type CallPresentationHistory = {
  type: 'canvas' | 'section' | 'file' | 'page' | 'canvas_page'
  notesContent?: string
  duration?: number
  timeStarted?: string
  name?: string
  id: string
  component_ids?: string[]
  page?: number
}[]

export type CallPresentationHistoryMetadata = {
  [key: string]: {
    rating: -1 | 0 | 1
  }
}

export type PresentationHistoryItem = CallPresentationHistory[number] & {
  rating?: -1 | 0 | 1
  pageIndex?: number
  thumbnail?: string
  enabled: boolean
  pages?: PresentationHistoryItem[]
}
