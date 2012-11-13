util = require('util')
MailProvider = require('./../mailprovider').MailProvider
MailConnector = require('./../mailconnector').MailConnector
util.dateFormat = require('./../utils').dateFormat


mailProvider = new MailProvider('localhost', 27017)

mail = new MailConnector
  username: process.env['mail_username']
  password: process.env['mail_password']
  host: 'imap.gmail.com'
  port: 993
  secure: true

filters =
  0:
    name: 'All'
    query: {}
  1:
    name: 'ABC'
    query: {"headers.from": 'mail@direct-11.bk.mufg.jp'}


exports.setup = (app) ->
  app.param('id', /^\d+$|^$/)

  app.get '/(:id)?', (req, res) ->
    filterId = req.params.id || 0
    query = filters[filterId].query
    try
      mailProvider.findAll query, (err, mails) ->
        throw err if err
        res.render 'index'
          filterId: filterId
          title: 'メール'
          mails: mails
          counts: mails.length
          util: util
          filters: filters
    catch e
      console.log("Error: ", e)
      res.render 'error'
        title: 'エラー'
        error: e

  app.get '/reload', (req, res) ->
    fromDate = '2012/8/1'
    query = "'SEEN', ['SINCE', #{fromDate}]"
    mail.openBox 'INBOX', false, (box) ->
      console.log "You have #{box.messages.total} messages in your INBOX"
      messageCount = box.messages
      mail.search eval("[#{query}]"), (messages) ->
        console.log("message: #{messages.length}")
        mailProvider.save messages, (error, mails) ->
          res.redirect '/'


