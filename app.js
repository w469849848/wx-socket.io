import io from './wxsocket.io/index'

//console.log('io ---> ' ,io)

// app.js
App({
  onLaunch: function() {
    // create a new socket object
    const socket = io("ws://127.0.0.1:3000")
    this.globalData.socket = socket
  },

  globalData:{
    userInfo: null,
  },
})
