# utility
exports.dateFormat = require('dateformat')

Date.prototype.format = (mask, utc) ->
  dateFormat(this, mask, utc)

