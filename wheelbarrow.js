var crypto = require('crypto')
  , detective = require('detective')

// generates a JavaScript payload from an array of input
// file sources
function build(files, load, callback) {
  if (!Array.isArray(files) || files.length === 0) {
    return callback(new Error('missing input files'))
  }

  // validate the input, and calculate each file's hash
  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    if (file.src == null) {
      return callback(new Error('missing file source'))
    }

    file.hash = sha1(file.src)
    file.src = file.src.toString('utf8')
  }

  // walk over the files
  walk(files, load, function (err, files) {
    if (err != null) {
      return callback(err)
    }

    // TODO: topological sorting
    // TODO: the payload generation
    // callback(null, payload)
  })
}

// walks an array of source files, loading each of their dependencies
function walk(files, load, callback) {
  var remaining = [].concat(files)
    , found = []
    , visited = {}

  function insert(err, origin, deps) {
    if (err != null) {
      return callback(err)
    }

    origin.deps = deps

    // groom all dependencies, and schedule them for inspection
    for (var i = 0; i < deps.length; i++) {
      var file = deps[i].file
      remaining.push(file)

      file.hash = sha1(file.src)
      file.src = file.src.toString('utf8')
    }

    found.push(origin)
    next()
  }

  function next() {
    while (remaining.length > 0) {
      var file = remaining.shift()

      // if we haven't visited this file before, find and resolve
      // its `require` dependencies
      if (!visited[file.hash]) {
        visited[file.hash] = true
        resolve(file, load, insert)
        return
      }
    }

    // we're done when there are no files to be walked remaining
    callback(null, found)
  }

  next()
}

// finds all required paths in a file and loads them using
// the user-provided load function
function resolve(origin, load, callback) {
  var paths = detective(origin.src)
    , out = []

  if (paths.length === 0) {
    return callback(null, origin, [])
  }

  // load each required module
  paths.forEach(function (path) {
    load(origin, path, function (err, file) {
      if (err != null) {
        return callback(err)
      }

      // basic file validation
      if (file.src == null) {
        return callback(new Error('loaded file missing source'))
      }

      out.push({ path: path, file: file })

      // are we done yet?
      if (out.length === paths.length) {
        callback(null, origin, out)
      }
    })
  })
}

// sha1 convenience function
function sha1(data) {
  var hash = crypto.createHash('sha1')
  hash.update(data)
  return hash.digest('hex')
}

module.exports = build
