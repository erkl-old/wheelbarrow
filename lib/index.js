var crypto = require('crypto')
  , uglify = require('uglify-js')
  , sort = require('./sort')
  , pack = require('./pack')
  , resolve = require('./resolve')
  , scan = require('./scan')
  , load = require('./load')

// generates a JavaScript payload from an array of input
// file sources
function build(files, options, callback) {
  if (!Array.isArray(files) || files.length === 0) {
    return callback(new Error('missing input files'))
  }

  // make the options argument optional
  if (typeof options === 'function') {
    callback = options
    options = {}
  }

  options.scan = options.scan || scan
  options.load = options.load || load
  options.minify = options.minify || false

  // validate the input, and calculate each file's hash
  for (var i = 0; i < files.length; i++) {
    var file = files[i]
    if (file.src == null) {
      return callback(new Error('missing file source'))
    }

    file.src = file.src.toString('utf8')
    file.hash = sha1(file.src)
  }

  // walk over the input files
  walk(files, options, function (err, files) {
    if (err != null) {
      return callback(err)
    }

    if (!(files = sort(files))) {
      return callback(new Error('input contains circular dependency'))
    }

    var payload = pack(files)

    // minify the output if we've been asked to
    if (options.minify) {
      try {
        payload = uglify.minify(payload, { fromString: true }).code
      } catch (err) {
        return callback(err)
      }
    }

    callback(null, payload)
  })
}

// walks an array of source files, loading each of their dependencies
function walk(files, opts, callback) {
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

      file.src = file.src.toString('utf8')
      file.hash = sha1(file.src)
    }

    found.push(origin)
    next()
  }

  function next() {
    while (remaining.length > 0) {
      var file = remaining.shift()
        , key = sha1(file.path + '\0' + file.src)

      // if we haven't visited this file before, find and resolve
      // its `require` dependencies
      if (!visited[key]) {
        visited[key] = file
        visit(file, opts, insert)
        return
      }

      file.deps = visited[key].deps
    }

    // we're done when there are no files to be walked remaining
    callback(null, found)
  }

  next()
}

// finds all required module names in a file and loads them using
// the user-provided require function
function visit(origin, opts, callback) {
  var names = opts.scan(origin)
    , out = []

  if (names.length === 0) {
    return callback(null, origin, [])
  }

  // load each required module
  names.forEach(function (name) {
    opts.load(origin, name, function (err, file) {
      if (err != null) {
        return callback(err)
      }

      // basic file validation
      if (file.src == null) {
        return callback(new Error('loaded file missing source'))
      }

      out.push({ name: name, file: file })

      // are we done yet?
      if (out.length === names.length) {
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
module.exports.load = load
module.exports.resolve = resolve
