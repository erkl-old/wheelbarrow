var fs = require('fs')
  , resolve = require('browser-resolve')

// resolve the dependency using browser-resolve, the same way
// browserify does it
function load(origin, path, callback) {
  resolve(path, { filename: origin.path }, function (err, resolved) {
    if (err != null) {
      return callback(err)
    }

    if (!resolved) {
      return callback(new Error('could not find module ' + resolved))
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
