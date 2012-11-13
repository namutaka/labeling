Mongo = require('mongodb')

MailProvider = (host, port) ->
  this.db= new Mongo.Db('node-mongo-mail',
    new Mongo.Server(host, port, {auto_reconnect: true}, {}))
  this.db.open(-> {})


MailProvider.prototype.getCollection= (callback) ->
  this.db.collection 'mails', callback


MailProvider.prototype.findAll = (query, callback) ->
  this.getCollection (error, collection) ->
    callback(error) if error
    collection.find(query).toArray callback


MailProvider.prototype.findById = (id, callback) ->
  this.getCollection (error, collection) ->
    callback(error) if error
    collection.findOne
      _id: Mongo.ObjectID.createFromHexString(id)
      , callback

MailProvider.prototype.save = (mails, callback) ->
  this.getCollection (error, collection) ->
    callback(error) if error

    mails = [mails] if not mails.length?
    collection.insert mails, ->
      callback(null, mails)


exports.MailProvider = MailProvider

