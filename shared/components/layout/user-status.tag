<user-status>
  <small if={ user.isLogged }>
    User: { user.name }
  </small>

  <small if={ !user.isLogged }>
    You are not<br /> logged!
  </small>

  <script>
    this.state = opts.state
    this.user = this.state.user

    this.state.on('user::logged', this.update)
  </script>
</user-status>