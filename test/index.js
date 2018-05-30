'use strict'

var browserify = require('browserify')
var replace = require('replace-method')
var path = require('path')
var fs = require('fs')
var ast = require('../')
var assert = require('assert')
var concat = require('concat-stream')

var fixture = fs.readFileSync(path.join(__dirname, 'fix.js'), {encoding: 'utf8'})

browserify(path.join(__dirname, 'src.js'))
	.transform(ast(function (file) {
		if (path.extname(file) !== '.js') return

		return function(ast, done) {
			// replace require calls with strings for some reason
			replace(ast)(['require'], function(node) {
				return { type: 'Literal', value: 'abc' }
			})

			done()
		}
	}))
	.bundle()
	// .pipe(fs.createWriteStream(path.join(__dirname, 'fix.js')))
	.pipe(concat(function (result) {
		assert.equal(result.toString(), fixture)
	}))
