import socketIO from 'socket.io'

export default function(server) {

  var io = socketIO.listen(server)

  io.on('connection', function(socket) {

    // start emitting fake data
    var pollingTimer
    pollingTimer = setInterval(() => {
      socket.emit('news', {
        title: `News title ${ new Date() }`,
        'description': `News description  ${ new Date() }`
      })
    }, Math.random() * 3000)

    socket.on('disconnect', () => clearTimeout(pollingTimer))
  })
}
