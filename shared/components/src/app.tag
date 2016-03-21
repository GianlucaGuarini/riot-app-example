// import the layout components
import './layout/sidebar.tag'
import './layout/user-status.tag'
// import all the pages
import './pages/index.tag'
import './pages/gallery.tag'
import './pages/login.tag'
import './pages/feed.tag'
import swal from 'sweetalert'

<app>
  <main name="main">
  </main>
  <sidebar state={ state }>
    <user-status state={ state }>
    </user-status>
  </sidebar>
  <script>

    // creating the app global state
    this.state = riot.observable({
      user: opts.user,
      view: null
    })

    this.mountSubview = (data) => {

      // we don't need to mount a new tag if nothing changed
      if (data.view == this.state.view) return

      // mount function shortcut
      var mount = () => riot.mount(this.main, data.view, data)
      // update the state view prop
      this.state.view = data.view
      // extend the data passed to this sub-view adding the state
      data.state = this.state

      if (IS_CLIENT)
        this
          .moveOut(this.main)
          .then(() => {
            var tag = mount()[0]
            this.moveIn(tag.root).then(() => tag.trigger('animation-completed'))
          })
      else mount()

      this.state.trigger('view::changed', this.state.view)

    }

    if (IS_CLIENT) {
      this.mixin('animation-features')
    }

    if (opts.view)
      this.mountSubview(opts)

    // state events logic

    // alert errors
    // they can come from any view
    this.state.on('user::error', (err) => this.alert('Login error', err))

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