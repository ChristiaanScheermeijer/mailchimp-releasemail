var fs = require('fs');
var Promise = require('bluebird');
var Mailchimp = require('mailchimp-api-v3');
var conventionalChangelog = require('conventional-changelog');

/**
 * @param {Object} settings
 * @returns {Promise}
 */
module.exports = function (settings) {
  settings = Object.assign({
    preset: 'angular',
    test:   false,
  }, settings || {});

  var requiredSettings = ['apiKey', 'listId', 'templateId', 'fromName', 'replyTo'];

  requiredSettings.forEach(function (key) {
    if (!settings[key]) {
      throw new Error('Missing required setting: ' + key);
    }
  });

  var mailchimp = new Mailchimp(settings.apiKey);
  var campaignId = null;
  var changelog = '';

  return new Promise(function (resolve, reject) {
    var stream = conventionalChangelog({
      preset:           settings.preset,
      outputUnreleased: false,
      releaseCount:     2,
    }, undefined, undefined, undefined, {
      mainTemplate:  fs.readFileSync(__dirname + '/../templates/template.hbs', { encoding: 'utf-8' }).toString(),
      headerPartial: fs.readFileSync(__dirname + '/../templates/header.hbs', { encoding: 'utf-8' }).toString(),
      commitPartial: fs.readFileSync(__dirname + '/../templates/commit.hbs', { encoding: 'utf-8' }).toString(),
      footerPartial: fs.readFileSync(__dirname + '/../templates/footer.hbs', { encoding: 'utf-8' }).toString(),
    });

    stream.on('data', function (data) {
      changelog += data;
    });

    stream.on('end', resolve);
    stream.on('error', reject);
  })
    .then(function () {
      return mailchimp.post({
        path: '/campaigns',
      }, {
        type:       'regular',
        recipients: {
          list_id: settings.listId,
        },
        settings:   {
          subject_line: settings.subject,
          preview_text: settings.previewText,
          title:        settings.title,
          from_name:    settings.fromName,
          reply_to:     settings.replyTo,
          template_id:  settings.templateId,
        },
      })
    })
    .then(function (response) {
      campaignId = response.id;

      const sections = Object.assign({
        changelog: changelog,
      }, settings.sections);

      return mailchimp.put({
        path: '/campaigns/' + campaignId + '/content',
      }, {
        template: {
          id:       settings.templateId,
          sections: sections,
        },
      });
    })
    .then(function () {
      // send test email to given emails
      if (settings.test) {
        return mailchimp.post({
          path: '/campaigns/' + campaignId + '/actions/test',
        }, {
          test_emails: settings.test.split(','),
          send_type:   'html',
        });
      }

      // send campaign
      return mailchimp.post({
        path: '/campaigns/' + campaignId + '/actions/send',
      });
    });
};
