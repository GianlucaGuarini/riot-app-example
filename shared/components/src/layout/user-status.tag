<user-status>
  <small if={ user.isLogged }>
    User: { user.name }
  </small>

  <small if={ !user.isLogged }>
    You are not<br /> logged!
  </small>

  <script>
    this.user = opts.user
    this.globalEvents = opts.globalEvents

    this.globalEvents.on('user::logged', this.update)
  </script>
</user-status>