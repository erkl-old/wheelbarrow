var detective = require('detective')

function scan (origin) {
  return detective(origin.src)
}

module.exports = scan
