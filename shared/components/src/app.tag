<app>
  <header>
  </header>
  <main name="main">
  </main>
  <sidebar global-events={ globalEvents } page={ view }></sidebar>
  <script>

    this.view = opts.view
    this.globalEvents = opts.globalEvents

    this.mountSubview = (data) => {
      this.view = data.view
      riot.mount(this.main, data.view, data)
      this.globalEvents.trigger('page::changed', this.view)
    }

    if (opts.view)
      this.mountSubview(opts)

  </script>
</app>