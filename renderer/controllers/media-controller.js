const electron = require('electron')

const ipcRenderer = electron.ipcRenderer

// Controls local play back: the <video>/<audio> tag and VLC
// Does not control remote casting (Chromecast etc)
module.exports = class MediaController {
  constructor (state) {
    this.state = state
  }

  mediaSuccess () {
    this.state.playing.result = 'success'
  }

  mediaStalled () {
    this.state.playing.isStalled = true
  }

  mediaError (error) {
    if (this.state.location.url() === 'player') {
      this.state.playing.result = 'error'
      this.state.playing.location = 'error'
      ipcRenderer.send('checkForVLC')
      ipcRenderer.once('checkForVLC', function (e, isInstalled) {
        this.state.modal = {
          id: 'unsupported-media-modal',
          error: error,
          vlcInstalled: isInstalled
        }
      })
    }
  }

  mediaTimeUpdate () {
    this.state.playing.lastTimeUpdate = new Date().getTime()
    this.state.playing.isStalled = false
  }

  mediaMouseMoved () {
    this.state.playing.mouseStationarySince = new Date().getTime()
  }

  vlcPlay () {
    ipcRenderer.send('vlcPlay', this.state.server.localURL)
    this.state.playing.location = 'vlc'
  }

  vlcNotFound () {
    if (this.state.modal && this.state.modal.id === 'unsupported-media-modal') {
      this.state.modal.vlcNotFound = true
    }
  }
}
