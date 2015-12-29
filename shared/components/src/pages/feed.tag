<feed>
  <h1>{ opts.data.title }</h1>
  <p>{ opts.data.message }</p>
  <p if={ !news.length }>Loading the news... ( new news any 3 seconds )</p>
  <ul>
    <li each={ news }>
      <img width="100%" src={ image } />
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
      this.gateway.off('news::published', onNewsPublished)
    })
  </script>
</feed>