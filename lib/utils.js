/*
 * Utils
 */

exports.dateFormat = require('dateformat');

Date.prototype.format = function(mask, utc) {
  return dateFormat(this, mask, utc);
};

