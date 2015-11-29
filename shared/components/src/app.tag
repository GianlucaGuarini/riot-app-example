<app>
  <header>
  </header>
  <main name="main">
  </main>
  <sidebar>
  </sidebar>
  <script>

    this.mountSubview = (data) => {
      riot.mount(this.main, data.view, data)
    }

    if (opts.view)
      this.mountSubview(opts)

  </script>
</app>