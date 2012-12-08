var Mongo = require('mongodb');

var MailProvider = function(host, port) {
  this.db = new Mongo.Db('labeling',
      new Mongo.Server(host, port, {
    auto_reconnect: true
  }, {}), {w: 1});
  this.db.open(function() {});
};

MailProvider.prototype.getCollection = function(callback) {
  this.db.collection('mails', callback);
};

MailProvider.prototype.findAll = function(query, callback) {
  return this.getCollection(function(error, collection) {
    if (error) return callback(error);

    collection.find(query).toArray(callback);
  });
};

MailProvider.prototype.findById = function(id, callback) {
  this.getCollection(function(error, collection) {
    if (error) return callback(error);

    collection.findOne({
      _id: Mongo.ObjectID.createFromHexString(id)
    }, callback);
  });
};

MailProvider.prototype.save = function(mails, callback) {
  return this.getCollection(function(error, collection) {
    if (error) return callback(error);

    if (!(mails.length != null)) {
      mails = [mails];
    }
    collection.insert(mails, function() {
      callback(null, mails);
    });
  });
};

exports.MailProvider = MailProvider;

