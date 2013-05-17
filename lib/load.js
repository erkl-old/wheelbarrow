var fs = require('fs')
  , resolve = require('./resolve')

// resolve the dependency using browser-resolve, the same way
// browserify does it
function load(origin, path, callback) {
  resolve(origin.path, path, function (err, resolved) {
    if (err != null) {
      return callback(err)
    }

    fs.readFile(resolved, 'utf8', function (err, src) {
      if (err != null) {
        return callback(err)
      }

      callback(null, { path: resolved, src: src })
    })
  })
}

module.exports = load
