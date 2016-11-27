import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import buble from 'rollup-plugin-buble'
import riot  from 'rollup-plugin-riot'

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
    })
  ]
}