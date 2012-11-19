var util = require('util');
var MailProvider = require('../lib/mailprovider').MailProvider;
var MailConnector = require('../lib/mailconnector').MailConnector;

util.dateFormat = require('../lib/utils').dateFormat;

var mailProvider = new MailProvider('localhost', 27017);

var mail = new MailConnector({
  username: process.env['mail_username'],
  password: process.env['mail_password'],
  host: 'imap.gmail.com',
  port: 993,
  secure: true
});

var filters = {
  0: {
    name: 'All',
    query: {}
  },
  1: {
    name: 'ABC',
    query: {
      "headers.from": 'mail@direct-11.bk.mufg.jp'
    }
  }
};


module.exports = function(app) {
  app.param('id', /^\d+$|^$/);
  app.get('/(:id)?', function(req, res) {
    var filterId = req.params.id || 0;
    var query = filters[filterId].query;
    try {
      mailProvider.findAll(query, function(err, mails) {
        if (err) throw err;

        res.render('index', {
          filterId: filterId,
          title: 'メール',
          mails: mails,
          counts: mails.length,
          util: util,
          filters: filters
        });
      });
    } catch (e) {
      console.log("Error: ", e);
      res.render('error', {
        title: 'エラー',
        error: e
      });
    }
  });

  app.get('/reload', function(req, res) {
    var fromDate = '2012/8/1';
    var query = ['SEEN', ['SINCE', fromDate ]];

    var fetch = mail.search('INBOX', query);
    fetch.on('message', function(message) {
      mailProvider.save(message, function(err, message) {
        if(err) throw err;
      });
    });

    fetch.on('end', function() {
      res.redirect('/');
    });
  });
};

