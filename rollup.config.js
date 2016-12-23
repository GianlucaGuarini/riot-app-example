import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import riot  from 'rollup-plugin-riot'
import inject from 'rollup-plugin-inject'

export default {
  entry: 'client/assets/js/src/index.js',
  dest: 'client/assets/js/bundle.js',
  format: 'umd',
  plugins: [
    riot(),
    buble(),
    commonjs(),
    nodeResolve({
      jsnext: true,
      main: true
    }),
    inject({
      swal: 'sweetalert',
      Swiper: 'swiper',
      Velocity: 'velocity-animate'
    })
  ]
}