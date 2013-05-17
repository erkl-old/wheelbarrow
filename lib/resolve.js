var browserResolve = require('browser-resolve')

function resolve(from, to, callback) {
  browserResolve(to, { filename: from }, function (err, resolved) {
    if (!err && !resolved) {
      return callback(new Error('could not find module ' + to))
    }
    callback(err, resolved)
  })
}

module.exports = resolve
