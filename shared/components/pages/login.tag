<login>
  <h1>{ opts.data.title }</h1>
  <p>{ opts.data.message }</p>
  <form ref="form" onsubmit={ tryLogin } if={ !user.isLogged } >
    <label>
      Email:
      <input ref="email" type="email" placeholder="my@email.com" />
    </label>
    <label>
      Password:
      <input ref="password" type="password" placeholder="12345" />
    </label>
    <button type="submit">
      Login!
    </button>
  </form>

  <p ref="user-message" if={ user.isLogged }>
    Welcome dear <b>{ user.name }</b>
  </p>

  <script>
    var onUserLogged = (user) => {
      this.user = user
      this.moveOut(this.refs.form).then(() => this.update())
    }

    this.state = opts.state
    this.user = this.state.user

    if (IS_CLIENT)
      this.mixin('animation-features')

    tryLogin(e) {
      var res = this.user.authenticate(this.refs.email.value, this.refs.password.value)

      e.preventDefault()

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