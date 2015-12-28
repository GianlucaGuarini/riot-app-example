<sidebar>
  <nav>
    <ul>
      <li class={ active: page == 'index' }>
        <a href="/">Home</a>
      </li>
      <li class={ active: page == 'feed' }>
        <a href="/feed">Feed</a>
      </li>
      <li class={ active: page == 'login' }>
        <a href="/login">Login</a>
      </li>
    </ul>
  </nav>
  <footer>
    <yield />
  </footer>

  <script>

    this.page = opts.page
    this.globalEvents = opts.globalEvents

    this.globalEvents.on('page::changed', (page) => {
      this.page = page
      this.update()
    })

  </script>
</sidebar>