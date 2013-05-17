var fs = require('fs')
  , join = require('path').join
  , wheelbarrow = require('../')

// this function will be used to resolve all detected
// `require()` calls
function load(origin, name, callback) {
  if (name === 'message') {
    return callback(null, { src: 'module.exports = "magic!"' })
  }

  // default to the built-in module loading function
  wheelbarrow.load(origin, name, callback)
}

// a.js will be our point of entry
var path = join(__dirname, 'a.js')
  , input =
    [ { path: path
      , src: fs.readFileSync(path, 'utf8')
      }
    ]

// bundle it all up!
wheelbarrow(input, { load: load }, function (err, payload) {
  if (err != null) {
    throw err
  }

  // eval the generated payload #YOLO
  eval(payload)
})
