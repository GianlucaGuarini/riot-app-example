<app>
  <main name="main">
  </main>
  <sidebar global-events={ globalEvents } page={ view }>
    <user-status global-events={ globalEvents } user={ parent.user }>
    </user-status>
  </sidebar>
  <script>

    var isClient = typeof window !== 'undefined'

    this.view = opts.view
    this.user = opts.user
    this.globalEvents = riot.observable()

    this.mountSubview = (data) => {

      var mount = () => riot.mount(this.main, data.view, data)

      this.view = data.view
      data.globalEvents = this.globalEvents
      data.user = this.user

      if (isClient)
        this
          .moveOut(this.main)
          .then(() => this.moveIn(mount()[0].root))
      else mount()

      this.globalEvents.trigger('page::changed', this.view)

    }

    if (isClient) {
      this.mixin('animation-features')
      this.mixin('alert')
    }

    if (opts.view)
      this.mountSubview(opts)

    // global events logic

    /**
     * User authentication
     */
    this.globalEvents.on('user::login', (data) => {
      var email = data.email,
        password = data.password,
        res = this.user.auth(email, password)

      if (res == true)
        this.globalEvents.trigger('user::logged', this.user)
      else
        this.globalEvents.trigger('user::error', res)
    })

    this.globalEvents.on('user::error', (err) => {
      this.alert('Login error', err)
    })

    this.globalEvents.on('user::logged', (err) => {
      this.alert(
        'Well done!',
        `You are logged in dear ${ this.user.name }!`,
        'success'
      )
    })

  </script>
</app>