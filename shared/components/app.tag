<app>
  <main ref="main">
  </main>
  <sidebar state={ state }>
    <user-status state={ state }>
    </user-status>
  </sidebar>
  <script>
    import { observable, mount } from 'riot'
    // import the layout components
    import './layout/sidebar.tag'
    import './layout/user-status.tag'
    // import all the pages
    import './pages/index.tag'
    import './pages/gallery.tag'
    import './pages/login.tag'
    import './pages/feed.tag'

    // creating the app global state
    this.state = observable({
      user: opts.user,
      view: null
    })

    this.mountSubview = (data) => {

      // we don't need to mount a new tag if nothing changed
      if (data.view == this.state.view) return
      // mount function shortcut
      var _mount = () => mount(this.refs.main, data.view, data)
      // update the state view prop
      this.state.view = data.view
      // extend the data passed to this sub-view adding the state
      data.state = this.state

      if (IS_CLIENT)
        this
          .moveOut(this.refs.main)
          .then(() => {
            var tag = _mount()[0]
            this.moveIn(tag.root).then(() => tag.trigger('animation-completed'))
          })
      else _mount()

      this.state.trigger('view::changed', this.state.view)

    }

    if (IS_CLIENT) {
      this.mixin('animation-features')
    }

    this.on('mount', function() {
      if (opts.view) this.mountSubview(opts)
    })

    // state events logic

    // alert errors
    // they can come from any view
    this.state.on('user::error', (err) => swal('Login error', err))

    // confirm when the user will log in
    this.state.on('user::logged', (err) => {
      swal(
        'Well done!',
        `You are logged in dear ${ this.state.user.name }!`,
        'success'
      )
    })
  </script>
</app>