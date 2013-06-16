var fs = require('fs')
  , path = require('path')
  , uglify = require('uglify-js')

// load the payload header
var raw = fs.readFileSync(path.join(__dirname, '../support/prelude.js'), 'utf8')
  , prelude = uglify.minify(raw, { fromString: true }).code

// reduce an array of files to a single JavaScript payload
function pack(files) {
  var ids = {}
    , next = 0

  var modules = files.map(function (file) {
    ids[file.hash] = next++

    var map = file.deps.map(function (dep) {
      return JSON.stringify(dep.name) + ':' + ids[dep.file.hash]
    }).join(',')

    return '[function(require,module,exports){' +
           file.src + '\n},{' + map + '}]'
  })

  return prelude + '([' + modules.join(',') + ']);'
}

module.exports = pack
