'use strict'

var recast = require('recast')
var through = require('through2')

module.exports = astTransform

function astTransform(transform, opts) {
  opts = opts || {}

  return function(file) {
    var stream = through(write, flush)
    var tr     = transform(file)
    var buffer = []

    if (!tr) return through()

    return stream

    function write(data, enc, cb) { buffer.push(data); cb() }

    function flush(cb) {
      buffer = buffer.join('')
      try {
        var ast = recast.parse(buffer, opts)
      } catch(e) {
        return stream.emit('error', e)
      }
      var s = this
      tr(ast, function(err, updated) {
        if (err) return stream.emit('error', err)

        try {
          var code = recast.print(updated || ast)
        } catch(e) {
          return stream.emit('error', e)
        }

        s.push(code.code || code)
        cb()
      })
    }
  }
}
