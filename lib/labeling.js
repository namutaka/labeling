/*
 * メールのラベル付け処理を行います
 */

var util = require('util');
var _ = require('underscore')._;

var detectors = [];

function Labeling() {
}

Labeling.prototype.labeling = function(message) {

  message.tag = (message.tag || []);
  message.subtag = (message.subtag || []);
  _.each(detectors, function(detector) {
    detector(message);
  });

  return message;
};



// test
detectors.push(function(message) {
  if ((message.headers.from||"").match(/qa\d/)) {
    message.tag.push("test");
  }
});

// deleted
detectors.push(function(message) {
  var reg = new RegExp(/This message (\d+) is already deleted by own/);
  if (ret = (message.subject||"").match(reg)) {
    message.tag.push("already_deleted");
    message.subtag.push(ret[1]);
  }
});


module.exports = Labeling;

