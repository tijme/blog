'use strict';
const htmlminifier = require('html-minifier').minify;
const minimatch = require('minimatch');

function OptimizeHTML(str, data) {
  const hexo = this;
  const options = hexo.config.html_minifier;
  // Return if disabled.
  if (options.enable === false) return;

  var path = data.path;
  var exclude = options.exclude;
  if (exclude && !Array.isArray(exclude)) exclude = [exclude];

  if (path && exclude && exclude.length) {
    for (var i = 0, len = exclude.length; i < len; i++) {
      if (minimatch(path, exclude[i], {matchBase: true})) return str;
    }
  }

  // Custom options
  options.removeAttributeQuotes = true;
  options.removeComments = true;
  options.removeRedundantAttributes = true;


  const log = hexo.log || console;
  let result = str;
  try {
    result = htmlminifier(str, options);
    let saved = str.length === 0 ? 0 : ((str.length - result.length) / str.length * 100).toFixed(2);
    log[options.silent ? 'debug' : 'info']('update Optimize HTML: %s [ %s saved]', path, saved + '%');
  } catch (e) {
    if (options.ignore_error) {
      log.debug('----------------------------------------');
      log.debug('ignore the parse error: %s \n%s', path, e);
      log.debug('----------------------------------------');
    } else {
      throw e;
    }
  }

  return result;
}

module.exports = OptimizeHTML;
