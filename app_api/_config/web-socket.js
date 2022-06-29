module.exports = webSocket

function webSocket(socket) {
  socket.on('message', data => {
    console.log('Here is the data from server', data)
  })

  socket.emit('data', { name: 'John Doe', age: 20, dob: 2223 })
}

function timing(callback) {
  setInterval(callback, 1000)
}
