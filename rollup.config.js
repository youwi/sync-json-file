import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

var pkg = require('./package.json')

export default {
	input: 'src/SyncServer',
	plugins: [
		commonjs(),
		resolve(),
	],
	// amd /  es6 / iife / umd /cjs
	output: [
		{ file: pkg.main, format: 'umd',name:"SyncServer" },
		{ file: pkg.module, format: 'es',	name: 'SyncServer',},
    { file: "SyncServer.js", format: 'cjs', },
    { file: "dist/SyncServer.js", format: 'cjs' },

  ],
}
