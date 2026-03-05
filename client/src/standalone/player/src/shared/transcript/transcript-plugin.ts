import videojs from 'video.js'
import { TranscriptPluginOptions } from './transcript-plugin-options'
import { VideojsPlayer, VideojsPlugin } from '../../types'
import { TranscriptButton } from './transcript-button'
import { TranscriptMenu } from './transcript-menu'

const Plugin = videojs.getPlugin('plugin') as typeof VideojsPlugin

class TranscriptPlugin extends Plugin {
  declare private transcriptMenu: TranscriptMenu
  declare private transcriptButton: TranscriptButton

  declare private readonly timeUpdateHandler: () => void

  constructor (player: VideojsPlayer, options?: TranscriptPluginOptions) {
    super(player)

    this.player.addClass('vjs-transcript')

    this.transcriptMenu = new TranscriptMenu(player, options)
    this.transcriptButton = new TranscriptButton(player, { ...options, transcriptMenu: this.transcriptMenu })

    player.addChild(this.transcriptMenu, options)

    const controlBarChildren = player.controlBar.children()
    const insertIndex = Math.max(controlBarChildren.length - 1, 0)
    player.controlBar.addChild(this.transcriptButton, {}, insertIndex)

    this.timeUpdateHandler = () => {
      if (!options || typeof options.currentTime !== 'function') return

      this.transcriptMenu.update(options.currentTime())
    }

    player.on('timeupdate', this.timeUpdateHandler)
  }

  dispose () {
    this.player.removeClass('vjs-transcript')

    this.player.off('timeupdate', this.timeUpdateHandler)

    this.transcriptMenu.dispose()
    this.player.removeChild(this.transcriptMenu)

    this.player.controlBar.removeChild(this.transcriptButton)
    this.transcriptButton.dispose()

    super.dispose()
  }
}

videojs.registerPlugin('transcript', TranscriptPlugin)

export { TranscriptPlugin }

