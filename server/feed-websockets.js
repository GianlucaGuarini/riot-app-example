import socketIO from 'socket.io'
import casual from 'casual'

export default function(server) {

  var io = socketIO.listen(server)

  io.on('connection', function(socket) {

    // start emitting fake data
    var pollingTimer
    pollingTimer = setInterval(() => {
      socket.emit('news', {
        title: casual.title,
        description: casual.description,
        image: `https://placeimg.com/720/280/any?${ new Date().getMilliseconds() }`
      })
    }, 3000)

    socket.on('disconnect', () => clearTimeout(pollingTimer))
  })
}
