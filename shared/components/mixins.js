import Velocity from 'velocity-animate'
import 'velocity-animate/velocity.ui'
import riot from 'riot/riot'
import swal from 'sweetalert'
import Swiper from 'swiper'

// add special animation features to the current tag instance
riot.mixin('animation-features', {
  features: { Velocity },
  defaultTransitions: {
    in: 'transition.slideUpIn',
    out: 'transition.slideUpOut'
  },
  moveIn: function (el) {
    return Velocity(el, this.defaultTransitions.in)
  },
  moveOut: function (el) {
    return Velocity(el, this.defaultTransitions.out)
  }
})

riot.mixin('swal', { swal })
riot.mixin('swiper', { Swiper })
