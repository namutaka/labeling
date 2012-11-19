var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

var util = require('util');
var _ = require('underscore')._;
var ImapConnection = require('imap').ImapConnection;
var MailParser = require("mailparser").MailParser;
var EventEmitter = require('events').EventEmitter;


function MailConnector(config) {
  this.die = __bind(this.die, this);
  this.imap = new ImapConnection(config);
  this.box = null;
}

MailConnector.prototype.die = function(err) {
  console.log('Error: ' + err);
  throw err;
};

MailConnector.prototype.openBox = function(mailboxName, openReadOnly, callback) {
  var self = this;
  this.imap.connect(function(err) {
    if (err) {
      callback(err);
      return;
    }
    self.imap.openBox(mailboxName, openReadOnly, function(err, box) {
      console.log("" + box.messages.total + " messages in " + mailboxName);
      self.box = box;
      callback(err, box);
    });
  });
};

/*
 * Return event emitter for searching
 *
 * error: Failed.
 * end: Finish.
 * message: get a message.
 */
MailConnector.prototype.search = function(mailboxName, query) {
  var self = this;
  var ev = new EventEmitter;

  this.openBox(mailboxName, false, function(err, box) {
    if (err) return ev.emit('error', err);
    self.imap.search(query, function(err, results) {
      if (err) return ev.emit('error', err);

      if (!results.length) {
        console.log("No match messages");
        self.imap.logout();
        ev.emit('end');
        return;
      }

      var fetch = self.imap.fetch(results, {
        request: {
          headers: false,
          body: "full"
        }
      });

      fetch.on('message', function(msg) {
        var parser = new MailParser;
        parser.on("end", function(message) {
          _.extend(msg, message)
          ev.emit('message', msg);
        });

        msg.on('data', function(data) {
          parser.write(data.toString());
        });
        msg.on('end', function() {
          parser.end();
        });
      });

      fetch.on('end', function() {
        console.log('Done fetching all messages!');
        self.imap.logout(self.finish);
        ev.emit('end');
      });
    });
  });

  return ev;
};

MailConnector.prototype.finish = function() {
  console.log("finish");
};


exports.MailConnector = MailConnector;

