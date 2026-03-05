export interface TranscriptPluginOptions {
  segments: Array<{
    start: number
    startFormatted: string
    text: string
  }>

  currentTime: () => number

  onSegmentClicked: (startTime: number) => void

  videoLanguage?: string
}

