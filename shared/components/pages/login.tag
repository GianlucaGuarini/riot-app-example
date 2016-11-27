<login>
  <h1>{ opts.data.title }</h1>
  <p>{ opts.data.message }</p>
  <form name="form" onsubmit={ tryLogin } if={ !user.isLogged } >
    <label>
      Email:
      <input name="email" type="email" placeholder="my@email.com" />
    </label>
    <label>
      Password:
      <input name="password" type="password" placeholder="12345" />
    </label>
    <button type="submit">
      Login!
    </button>
  </form>

  <p name="user-message" if={ user.isLogged }>
    Welcome dear <b>{ user.name }</b>
  </p>

  <script>
    var onUserLogged = (user) => {
      this.user = user
      this.moveOut(this.form).then(() => this.update())
    }

    this.state = opts.state
    this.user = this.state.user

    if (this.state.isClient)
      this.mixin('animation-features')

    tryLogin() {
      var res = this.user.authenticate(this.email.value, this.password.value)

      if (res == true)
        this.state.trigger('user::logged', this.user)
      else
        this.state.trigger('user::error', res)
    }

    this.state.on('user::logged', onUserLogged)

    this.on('unmount', () => {
      this.state.off('user::logged', onUserLogged)
    })
  </script>
</login>