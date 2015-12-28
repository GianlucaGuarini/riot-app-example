import Velocity from 'velocity-animate'
import 'velocity-animate/velocity.ui'
import swal from 'sweetalert'

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

riot.mixin('alert', {
  alert: swal
})