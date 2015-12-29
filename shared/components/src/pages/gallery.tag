<gallery>
  <h1>{ opts.data.title }</h1>
  <p>{ opts.data.message }</p>
  <!-- Slider main container -->
  <article class="swiper-container" name="swiper-container">
      <!-- Additional required wrapper -->
      <div class="swiper-wrapper">
          <!-- Slides -->
          <div each={ image in opts.data.images } class="swiper-slide">
            <img class="swiper-lazy" width="100%" data-src={ image } />
            <div class="swiper-lazy-preloader"></div>
          </div>
      </div>
        <!-- Add Pagination -->
      <div class="swiper-pagination" name="swiper-pagination"></div>
      <!-- Add Arrows -->
      <div class="swiper-button-next" name="swiper-button-next"></div>
      <div class="swiper-button-prev" name="swiper-button-prev"></div>
  </article>
  <script>
    var onSlideChanged = (id) => {
        riot.route(`gallery/${this.gateway.slideId}`) // update the url
        this.swiper.slideTo(id)
      }

    this.state = opts.state
    this.gateway = opts.gateway

    if (IS_CLIENT) {
      this.mixin('swiper')
      this.one('animation-completed', () => {
        this.swiper = new this.Swiper(
          this['swiper-container'], {
            pagination: this['swiper-pagination'],
            nextButton: this['swiper-button-next'],
            prevButton: this['swiper-button-prev'],
            initialSlide: this.gateway.slideId - 1,
            paginationClickable: true,
            setWrapperSize: true,
            lazyLoading: true,
            preloadImages: false,
            centeredSlides: true,
            keyboardControl: true,
            loop: true
          }
        )
        // on slide change
        this.swiper.on('slideChangeEnd', () => {
          this.gateway.slideId = this.swiper.activeIndex
        })
        // sync the slider with the url
        this.gateway.on('slide::changed', onSlideChanged)
      })
    }

    this.on('unmount', () => {
      this.gateway.off('slide::changed', onSlideChanged)
      this.swiper.destroy()
    })
  </script>
</gallery>