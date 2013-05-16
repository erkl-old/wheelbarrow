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
    var r = lock(modules[i][1])
      , m = { exports: {} }

    modules[i][0].call(m.exports, r, m, m.exports)
    loaded.push(m)
  }
})([/* modules are injected here */])
