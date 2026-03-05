import videojs from 'video.js'
import { TranscriptPluginOptions } from './transcript-plugin-options'
import { TranscriptMenu } from './transcript-menu'
import { VideojsButton, VideojsButtonOptions, VideojsPlayer } from '../../types'

const Button = videojs.getComponent('Button') as typeof VideojsButton

class TranscriptButton extends Button {
  declare options_: TranscriptPluginOptions & { transcriptMenu: TranscriptMenu } & VideojsButtonOptions

  // Extend constructor options typings
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor (
    player: VideojsPlayer,
    options?: TranscriptPluginOptions & { transcriptMenu: TranscriptMenu } & VideojsButtonOptions
  ) {
    super(player, options)
  }

  createEl () {
    const button = videojs.dom.createEl('button', {
      className: 'vjs-transcript-button vjs-control vjs-button',
      type: 'button'
    }) as HTMLButtonElement

    const icon = videojs.dom.createEl('span', {
      className: 'vjs-icon-placeholder'
    }) as HTMLElement
    icon.textContent = '≡'

    const controlText = videojs.dom.createEl('span', {
      className: 'vjs-control-text'
    }) as HTMLElement
    if (controlText) {
      controlText.textContent = this.player().localize('Transcript')
    }

    button.appendChild(icon)
    button.appendChild(controlText)
    button.title = this.player().localize('Transcript')

    return button
  }

  handleClick () {
    const menu = this.options_.transcriptMenu

    if (this.player().hasClass('transcript-menu-displayed')) {
      menu.close()
    } else {
      menu.open()
    }
  }
}

videojs.registerComponent('TranscriptButton', TranscriptButton)

export { TranscriptButton }

