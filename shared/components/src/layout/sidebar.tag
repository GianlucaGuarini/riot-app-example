<sidebar>
  <nav>
    <ul>
      <li class={ active: state.view == 'index' }>
        <a href="/">Home</a>
      </li>
      <li class={ active: state.view == 'feed' }>
        <a href="/feed">Feed</a>
      </li>
      <li class={ active: state.view == 'gallery' }>
        <a href="/gallery">Gallery</a>
      </li>
      <li class={ active: state.view == 'login' }>
        <a href="/login">Login</a>
      </li>
    </ul>
  </nav>
  <footer>
    <yield />
  </footer>

  <script>
    this.state = opts.state
    this.state.on('view::changed', () => this.update())
  </script>
</sidebar>