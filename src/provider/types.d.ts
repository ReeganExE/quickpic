export interface ImageDetails {
  url: string
}

export type OnProgress = (e: ProgressEvent) => void

export interface ProgressEvent {
  loaded: number
  total: number
}
