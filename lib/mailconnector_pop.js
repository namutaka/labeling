var util = require('util');
var _ = require('underscore')._;

var POP3Client = require("poplib");

var MailParser = require("mailparser").MailParser;
var EventEmitter = require('events').EventEmitter;


function MailConnector(config) {
  this.config = config;
}

/*
 * Return event emitter for searching
 *
 * error: Failed.
 * end: Finish.
 * message: get a message.
 */
MailConnector.prototype.search = function() {

  var self = this;
  var client = this.client;
  var ev = new EventEmitter;
  this.msgcount = 0;
  this.currentMsgNumber = 0;

  function next() {
    if (self.currentMsgNumber < self.msgcount && self.currentMsgNumber < 50) {
      client.retr(self.currentMsgNumber + 1);
      self.currentMsgNumber += 1;
    } else {
      client.quit();
    }
  }

  client = new POP3Client(this.config['port'], this.config['host'], this.config);

  client.on("connect", function() {
    console.log("CONNECT success");
    client.login(self.config.username, self.config.password);
  });

  client.on("login", function(status, rawdata) {
    if (status) {
      console.log("LOGIN/PASS success");
      client.list();
    } else {
      console.log("LOGIN/PASS failed");
      client.quit();
    }
  });

  client.on("list", function(status, msgcount, msgnumber, data, rawdata) {
    if (status === false) {
      console.log("LIST failed");
      client.quit();
    } else {
      console.log("LIST success with " + msgcount + " element(s)");
      self.msgcount = msgcount;
      self.currentMsgNumber = 0;
      next();
    }
  });

  client.on("retr", function(status, msgnumber, data, rawdata) {
    if (status === true) {
      console.log("RETR success for msgnumber " + msgnumber);

      var parser = new MailParser;
      parser.on("end", function(message) {
        ev.emit('message', message);
        next();
      });
      parser.write(data.toString());
      parser.end();

    } else {
      console.log("RETR failed for msgnumber " + msgnumber);
      client.quit();
    }
  });

  client.on("quit", function(status, rawdata) {
    if (status === true) console.log("QUIT success");
    else console.log("QUIT failed");

    ev.emit('end');
  });

  // エラー対応
  client.on("error", function(err) {
    if (err.errno === 111) console.log("Unable to connect to server");
    else console.log("Server error occurred");

    console.log(err);
    ev.emit('error', err);
  });

  client.on("invalid-state", function(cmd) {
    console.log("Invalid state. You tried calling " + cmd);
    ev.emit('error', "Invalid state. You tried calling " + cmd);
  });

  client.on("locked", function(cmd) {
    console.log("Current command has not finished yet. You tried calling " + cmd);
    ev.emit('error', "Current command has not finished yet. You tried calling " + cmd);
  });

  return ev;
};

exports.MailConnector = MailConnector;

