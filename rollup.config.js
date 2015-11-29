import npm from 'rollup-plugin-npm'
import commonjs from 'rollup-plugin-commonjs'
import inject from 'rollup-plugin-inject'
import babel from 'rollup-plugin-babel'

export default {
  entry: 'client/assets/js/src/index.js',
  dest: 'client/assets/js/bundle.js',
  format: 'umd',
  plugins: [
    babel({
      // all the es2015
      // excluding transform-es2015-modules-commonjs
      plugins: [
        'check-es2015-constants',
        'transform-es2015-arrow-functions',
        'transform-es2015-block-scoped-functions',
        'transform-es2015-block-scoping',
        'transform-es2015-classes',
        'transform-es2015-computed-properties',
        'transform-es2015-destructuring',
        'transform-es2015-for-of',
        'transform-es2015-function-name',
        'transform-es2015-literals',
        'transform-es2015-object-super',
        'transform-es2015-parameters',
        'transform-es2015-shorthand-properties',
        'transform-es2015-spread',
        'transform-es2015-sticky-regex',
        'transform-es2015-template-literals',
        'transform-es2015-typeof-symbol',
        'transform-es2015-unicode-regex',
        'transform-regenerator',
        'external-helpers-2'
      ]
    }),
    npm({
      jsnext: true,
      main: true,
      skyp: ['http']
    }),
    inject({
      riot: 'riot/riot'
    }),
    commonjs()
  ]
}