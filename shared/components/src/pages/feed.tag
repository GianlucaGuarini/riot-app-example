<feed>
  <h1>{ opts.data.title }</h1>
  <p>{ opts.data.message }</p>
  <ul>
    <li each={ news }>
      <h2>{ title }</h2>
      <p>{ description }</p>
    </li>
  </ul>
  <script>

    var onNewsPublished = (news) => {
      this.news.push(news)
      this.update()
    }

    this.gateway = opts.gateway
    this.news = opts.data.news

    this.gateway.listen()
    this.gateway.on('news::published', onNewsPublished)

    this.on('unmount', () => {
      this.gateway.socket.disconnect()
    })

  </script>
</feed>