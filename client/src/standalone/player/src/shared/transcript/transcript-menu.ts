import videojs from 'video.js'
import { TranscriptPluginOptions } from './transcript-plugin-options'
import { VideojsComponent, VideojsComponentOptions, VideojsPlayer } from '../../types'

const Component = videojs.getComponent('Component') as typeof VideojsComponent

class TranscriptMenu extends Component {
  declare options_: TranscriptPluginOptions & VideojsComponentOptions

  declare private readonly userInactiveHandler: () => void
  declare private readonly onPlayerClick: (event: Event) => void

  declare private segmentsContainer: HTMLElement
  declare private segmentElements: HTMLElement[]

  constructor (player: VideojsPlayer, options?: TranscriptPluginOptions & VideojsComponentOptions) {
    super(player, options)

    this.segmentElements = []

    this.userInactiveHandler = () => {
      this.close()
    }

    this.player().on('userinactive', this.userInactiveHandler)

    this.onPlayerClick = event => {
      let current = event.target as HTMLElement

      do {
        if (
          current.classList.contains('vjs-transcript-menu') ||
          current.classList.contains('vjs-transcript-button')
        ) {
          return
        }

        current = current.parentElement
      } while (current)

      this.close()
    }

    this.player().on('click', this.onPlayerClick)
  }

  dispose () {
    this.player().off('userinactive', this.userInactiveHandler)
    this.player().off('click', this.onPlayerClick)

    super.dispose()
  }

  createEl () {
    const menu = super.createEl('div', {
      className: 'vjs-transcript-menu',
      tabIndex: -1
    }) as HTMLElement

    const header = super.createEl('div', {
      className: 'vjs-transcript-header'
    }) as HTMLElement

    const title = super.createEl('div', {
      innerText: this.player().localize('Transcript'),
      className: 'vjs-transcript-title'
    })

    const closeButton = super.createEl('button', {
      className: 'vjs-transcript-close',
      innerText: '×',
      tabIndex: -1
    }) as HTMLButtonElement
    closeButton.addEventListener('click', () => this.close())

    header.appendChild(title)
    header.appendChild(closeButton)

    this.segmentsContainer = super.createEl('div', {
      className: 'vjs-transcript-segments'
    }) as HTMLElement

    this.segmentElements = []

    for (const segment of this.options_.segments) {
      const segmentEl = super.createEl('div', {
        className: 'vjs-transcript-segment',
        tabIndex: 0
      }) as HTMLElement

      segmentEl.dataset.start = segment.start.toString()

      const timeSpan = super.createEl('span', {
        className: 'vjs-transcript-time',
        innerText: segment.startFormatted
      }) as HTMLElement

      const textSpan = super.createEl('span', {
        className: 'vjs-transcript-text',
        innerText: segment.text
      }) as HTMLElement

      segmentEl.appendChild(timeSpan)
      segmentEl.appendChild(textSpan)

      segmentEl.addEventListener('click', event => {
        event.preventDefault()
        this.options_.onSegmentClicked(segment.start)
        this.player().userActive(true)
      })

      segmentEl.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.code === 'Space' || event.code === 'Enter') {
          event.preventDefault()
          this.options_.onSegmentClicked(segment.start)
          this.player().userActive(true)
        }
      })

      this.segmentsContainer.appendChild(segmentEl)
      this.segmentElements.push(segmentEl)
    }

    menu.appendChild(header)
    menu.appendChild(this.segmentsContainer)

    this.update(this.options_.currentTime())

    return menu
  }

  open () {
    this.player().addClass('transcript-menu-displayed')
  }

  close () {
    this.player().removeClass('transcript-menu-displayed')
  }

  update (currentTime: number) {
    const segments = this.options_.segments
    if (!segments || segments.length === 0) return
    if (isNaN(currentTime)) return

    let activeIndex = -1

    for (let i = segments.length - 1; i >= 0; i--) {
      if (segments[i].start <= currentTime) {
        activeIndex = i
        break
      }
    }

    for (const el of this.segmentElements) {
      el.classList.remove('vjs-active')
    }

    if (activeIndex === -1) return

    const activeEl = this.segmentElements[activeIndex]
    if (!activeEl) return

    activeEl.classList.add('vjs-active')

    this.scrollSegmentIntoView(activeEl)
  }

  private scrollSegmentIntoView (segmentEl: HTMLElement) {
    if (!this.segmentsContainer) return

    segmentEl.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest'
    })
  }
}

videojs.registerComponent('TranscriptMenu', TranscriptMenu)

export { TranscriptMenu }

