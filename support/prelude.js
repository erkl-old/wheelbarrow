// this snippet hosts each generated JavaScript payload
(function (modules) {
  var loaded = []

  // generate a require function which only allows lookups
  // of modules in the provided map
  function lock(map) {
    return function (path) {
      if (typeof map[path] === 'undefined') {
        throw new Error('unknown module ' + path)
      }
      return loaded[map[path]]
    }
  }

  // one at a time, initialise each module
  for (var i = 0; i < modules.length; i++) {
    var require = lock(modules[i][1])
      , exports = {}
      , module = { exports: exports }

    modules[i][0].call(exports, require, module, exports)
    loaded.push(module.exports)
  }
})
