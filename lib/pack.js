var fs = require('fs')

// load the payload header
var prelude = fs.readFileSync(__dirname + '/prelude.js', 'utf8')

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
           file.src + '},{' + map + '}]'
  })

  return prelude.replace('/* inject modules here */', modules.join(','))
}

module.exports = pack
