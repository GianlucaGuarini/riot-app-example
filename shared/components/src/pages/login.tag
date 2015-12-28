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

    this.globalEvents = opts.globalEvents
    this.user = opts.user

    tryLogin() {
      this.globalEvents.trigger('user::login', {
        email: this.email.value,
        password: this.password.value
      })
    }

    this.globalEvents.on('user::logged', (user) => {
      this.mixin('animation-features')
      this.user = user
      this.moveOut(this.form).then(() => this.update())
    })
  </script>
</login>