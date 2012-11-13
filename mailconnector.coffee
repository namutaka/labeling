util = require('util')
ImapConnection = require('imap').ImapConnection
MailParser = require("mailparser").MailParser

class MailConnector
  constructor: (config) ->
    @imap = new ImapConnection(config)
    @box = null

  die: (err) =>
    console.log('Uh oh: ' + err)
    throw err

  # mailboxName, openReadOnly
  openBox: (mailboxName, openReadOnly, callback) ->
    @imap.connect (err) =>
      @die err if err

      @imap.openBox mailboxName, openReadOnly, (err, @box) ->
        @die err if err
        callback(@box)

  search: (query, callback) ->
    @imap.search query, (err, results) =>
        @die err if err

        unless results.length
          console.log "No match messages"
          @imap.logout
          callback([])
          return

        messages = []
        fetch = @imap.fetch results,
          request:
            headers: false #['from', 'to', 'subject', 'date']
            body: "full"

        fetch.on 'message', (msg) ->
          parser = new MailParser

          parser.on "end", (message) ->
            for key of message
                msg[key] = message[key]
            messages.push(msg)

          msg.on 'data', (data) ->
            parser.write(data.toString())

          msg.on 'end', ->
            parser.end()

        fetch.on 'end', =>
          console.log('Done fetching all messages!')
          @imap.logout @finish
          callback(messages)

  finish: ->
    console.log("finish")

exports.MailConnector = MailConnector

