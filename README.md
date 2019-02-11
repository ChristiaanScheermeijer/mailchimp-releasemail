# mailchimp-releasemail

Send automated release mails with Conventional Changelog via MailChimp.

## Prerequisites

- [MailChimp API Key](https://us1.admin.mailchimp.com/account/api/)
- [MailChimp list id](https://us1.admin.mailchimp.com/lists/)
- [MailChimp template id](https://us1.admin.mailchimp.com/templates/)
  * In order to use [Sections](https://mailchimp.com/help/create-editable-content-areas-with-mailchimps-template-language/), you must create a custom template.
  * Template id is a string
  * Use the `mc:edit="changelog"` section to inject the changelog

## CLI

If you want to use the CLI, you can install this package globally:

```
$ npm install mailchimp-releasemail -g
```

This will install the `release-mail` binary.

When using the CLI, it will automatically look for an `.releasemailrc` file in the current working directory. Your can change this by using the `--config` flag.

## .releasemailrc

The `.releasemailrc` file is a JavaScript file which will be required by the releasemail script. Below an example:

```
var pkg = require('./package.json');

module.exports = {
  apiKey:      process.env.MC_API_KEY,
  subject:     'Software release v' + pkg.version + ' 🚀',
  previewText: 'See all new features and bug fixes',
  listId:      '<mailchimp list id>',
  fromName:    'Your name',
  replyTo:     'your@email.com',
  templateId:  11223344,
  sections:    {
    version: 'v' + pkg.version,
  },
};
```

## Node

It is also possible to send release mails from your node script.

```
$ npm install mailchimp-releasemail
```

Now you can use it like so:

```
var releasemail = require('mailchimp-releasemail');
var pkg = require('./package.json');

releasemail({
  apiKey:      process.env.MC_API_KEY,
  subject:     'Software release v' + pkg.version + ' 🚀',
  previewText: 'See all new features and bug fixes',
  listId:      '<mailchimp list id>',
  fromName:    'Your name',
  replyTo:     'your@email.com',
  templateId:  11223344,
  sections:    {
    version: 'v' + pkg.version,
  },
}).then(function() {
  // success :-D
}).catch(function() {
  // error :-(
});
```
