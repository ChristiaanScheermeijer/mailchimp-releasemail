#! /usr/bin/env node
var meow = require('meow');
var path = require('path');
var fs = require('fs');
var releasemail = require('../');

var cli = meow(`
        Usage
          $ release-mail <options>
                    
        Options
          --config, -c  Release mail config location. Defaults to '.releasemailrc'
          --apiKey, -a  MailChimp API key
          --test,   -t  Send a preview email instead of the campaign
          --version     Shows the current release-mail version
          --help        You are probably looking at it now..
          
        Examples
          $ release-mail --apiKey 1111111122222222333333
          $ release-mail --config ./path/to/config.js --apiKey 1111111122222222333333
          $ release-mail --apiKey 1111111122222222333333 --test your@email.com,yoursecond@email.com
`, {
  flags: {
    config: {
      type:  'string',
      alias: 'c',
    },
    apiKey: {
      type:  'string',
      alias: 'c',
    },
    test:   {
      type:  'string',
      alias: 't',
    },
  },
});

var configLocation = path.join(process.cwd(), cli.flags.config || '.releasemailrc');

if (!fs.existsSync(configLocation)) {
  console.log('Config not found at location: ' + configLocation);
  process.exit(1);
}

var settings = require(configLocation);

if (cli.flags.test) {
  settings.test = cli.flags.test;
}

if (cli.flags.apiKey) {
  settings.apiKey = cli.flags.apiKey;
}

releasemail(settings)
  .then(function () {
    console.log('Release mail is sent!');
  })
  .catch(function (error) {
    console.log(error.message);
  });


