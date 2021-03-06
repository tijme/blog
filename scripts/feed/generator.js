'use strict';

var nunjucks = require('nunjucks');
var pd = require('pretty-data').pd;
var env = new nunjucks.Environment();
var pathFn = require('path');
var fs = require('fs');
var gravatar = require('hexo/lib/plugins/helper/gravatar');

env.addFilter('uriencode', function(str) {
  return encodeURI(str);
});

env.addFilter('noControlChars', function(str) {
  return str.replace(/[\x00-\x1F\x7F]/g, '');
});

var rss2TmplSrc = pathFn.join(__dirname, '../../themes/custom/rss2.xml');
var rss2Tmpl = nunjucks.compile(fs.readFileSync(rss2TmplSrc, 'utf8'), env);

module.exports = function(locals) {
  var config = this.config;
  var feedConfig = config.feed;
  var template = rss2Tmpl;

  var posts = locals.posts.sort('-date');
  posts = posts.filter(function(post) {
    return post.draft !== true && post.show_in_home == true;
  });

  if (feedConfig.limit) posts = posts.limit(feedConfig.limit);

  var url = config.url;
  if (url[url.length - 1] !== '/') url += '/';

  var icon;
  if (config.email) icon = gravatar(config.email);

  var version = fs.readFileSync('.semver', 'utf8').trim();

  var xml = pd.xmlmin(template.render({
    config: config,
    url: url,
    icon: icon,
    posts: posts,
    version: version,
    url_and_folder: (config.url + config.root).replace(/([^:]\/)\/+/g, "$1"),
    feed_url: (config.url + config.root + feedConfig.public_path).replace(/([^:]\/)\/+/g, "$1")
  }));

  return {
    path: feedConfig.path,
    data: xml
  };
};
