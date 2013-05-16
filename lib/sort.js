function sort(files) {
  var sorted = []
    , edges = []

  // generate a complete list of all edges between files
  for (var i = 0; i < files.length; i++) {
    for (var j = 0; j < file[i].deps.length; j++) {
      edges.push({ from: file[i], to: file[i].deps[j] })
    }
  }

  // find all top-level files
  var top = files.filter(function (file) {
    return incoming(edges, file) === 0
  })

  while (top.length > 0) {
    var file = top.shift()
      , removed = []

    sorted.unshift(file)

    // remove this file's outgoing edges
    edges = edges.filter(function (edge) {
      if (edge.from === file) {
        removed.push(edge.to)
        return false
      }
      return true
    })

    // of the edges removed in the last cycle, see how many of them
    // pointed to files which now have no incoming edges
    removed.forEach(function (file) {
      if (incoming(edges, file) === 0) {
        top.push(file)
      }
    })
  }

  return edges.length > 0 ? null : sorted
}

// count the number of edges going to a particular file
function incoming(edges, file) {
  return edges.reduce(function (total, edge) {
    return edge.to === file ? total + 1 : total
  }, 0)
}

module.exports = sort
