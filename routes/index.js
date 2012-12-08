var util = require('util');
util.dateFormat = require('../lib/utils').dateFormat;
var _ = require('underscore')._;
var MailProvider = require('../lib/mailprovider').MailProvider;

var Labeling = require('../lib/labeling');

//var MailConnector = require('../lib/mailconnector').MailConnector;
var MailConnector = require('../lib/mailconnector_pop').MailConnector;


var mailProvider = new MailProvider('localhost', 27017);

var mail = new MailConnector({
  username: process.env['mail_username'],
  password: process.env['mail_password'],
  host: process.env['mail_host'],
  port: process.env['mail_port'],
  secure: true,
  enabletls: true
});

var labeling = new Labeling();

var filters = {
  0: {
    name: 'All',
    query: {}
  }
};

filters[2] = {
  name: 'test',
  query: {
    "tag": 'test'
  }
};

filters[3] = {
    name: 'enquete',
    query: {
      "tag": 'enquete'
    }
};

filters[4] = {
  name: 'already_deleted',
  query: {
    "tag": 'already_deleted'
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

        var subtags = _.uniq(mails, false, function(mail) {
          return mail.subtag;
        });

        mails = _.sortBy(mails, function(mail) {
          return mail.subtag[0];
        });

        res.render('index', {
          filterId: filterId,
          title: 'メール',
          mails: mails,
          counts: mails.length,
          util: util,
          subtags: subtags,
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
    var msg_cache = [];
    fetch.on('message', function(message) {
      msg_cache.push(labeling.labeling(message));
      if (msg_cache.length > 10) {
        mailProvider.save(msg_cache, function(err, messages) {
          if(err) throw err;
        });
        msg_cache = [];
      }
    });

    fetch.on('error', function(err) {
      res.render('error', {
        title: 'エラー',
        error: err
      });
    });

    fetch.on('end', function() {
      if (msg_cache.length > 0) {
        mailProvider.save(msg_cache, function(err, messages) {
          if(err) throw err;
        });
      }
      res.redirect('/');
    });
  });
};

