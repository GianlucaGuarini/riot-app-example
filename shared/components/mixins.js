import { mixin } from 'riot'

// add special animation features to the current tag instance
mixin('animation-features', {
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

