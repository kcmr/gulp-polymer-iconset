var fs = require('fs');
var path = require('path');

var gulpUtil = require('gulp-util');
var through2 = require('through2');
var cheerio  = require('cheerio');
var _        = require('lodash');

// load the iconset template
var iconSetTemplatePath = path.join(__dirname, 'lib/iconset-template.html');
var iconSetTemplate     = fs.readFileSync(iconSetTemplatePath, 'utf8');
var renderIconSetHtml   = _.template(iconSetTemplate);

// default values for options
var DEFAULT_OPTIONS = {
  /**
   * Name to be given to the icon
   * @param  {Vinyl} file
   * @return {String}     the id of the icon
   */
  iconId: function (file) {
    return path.basename(file.path, '.svg');
  },

  /**
   * Size
   * @type {Number}
   */
  iconSize: 24,

  // path
  ironIconsetSvgPath: '../iron-iconset-svg/iron-iconset-svg.html',

  /**
   * Iconset file name
   * @type {String}
   */
  fileName: null,

  /**
   * Name for Composer flags
   * @type {String}
   */
  composerName: null
};

function polymerIconset(options) {

  // set default options
  options = options || {};
  _.defaults(options, DEFAULT_OPTIONS);

  // check for required options
  if (!options.iconsetName) {
    throw new gulpUtil.PluginError(
      'gulp-polymer-iconset',
      'iconsetName option is required'
    );
  }

  // default filename if is not set
  if (!options.fileName) {
    options.fileName = options.iconsetName + '.html';
  }

  // start an empty icons string
  var iconsSvgString = '';

  function bufferContents(file, encoding, cb) {
    // evaluate options according to file
    var iconId = (typeof options.iconId === 'function') ? options.iconId(file) : options.iconId;
    var iconSelector = (typeof options.iconSelector === 'function') ? options.iconSelector(file) : options.iconSelector;

    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }

    if (file.isBuffer()) {
      // build a cheerio dom
      var $ = cheerio.load(file.contents.toString(encoding), {
        xmlMode: true
      });

      // find the svg node
      var svgNode = $('svg');

      // check if the icon is made of multiple nodes
      var svgNodeContents = svgNode.children();

      // remove problematic attributes
      $('path, g, use, [id], style').each(function() {
        var elem = $(this);
        elem.removeAttr('id');
        elem.removeAttr('fill');
        elem.removeAttr('viewBox');
        elem.removeAttr('style');
        if (elem.is('style')) {
          elem.remove();
        }
      });

      if (svgNodeContents.length === 1 && $(svgNodeContents[0]).is('g')) {
          // the icon is ready to be added to the iconset file

          // give id to the iconNode
          $(svgNodeContents[0]).attr('id', iconId);
          $(svgNodeContents[0]).attr('fill-rule', 'evenodd');

          iconsSvgString += $.xml(svgNodeContents[0]);
        } else {
          // the icon is not ready to be added,
          // we must wrap it with an 'g' (group) tag
          // before adding

          iconsSvgString += '\n<g id="' + iconId + '" fill-rule="evenodd">\n' + $.xml(svgNodeContents) + '\n</g>';
        }

        iconsSvgString = iconsSvgString.replace(/<defs\/>/, '');
      }

      if (file.isStream()) {
        throw new gulpUtil.PluginError(
          'gulp-polymer-iconset',
          'streams not currently supported'
        );
      }

      // invoke callback and pass no files
      cb();
    }

  function endStream(cb) {
    // set the iconsSvgString onto options
    var renderOptions = _.assign({
      iconsSvgString: iconsSvgString,
    }, options);

    // render the template
    var iconSetHtml = renderIconSetHtml(renderOptions);

    // create the file object
    var file = new gulpUtil.File({
      path: options.fileName,
      contents: new Buffer(iconSetHtml),
    });

    // send the file downwards the stream
    this.push(file);

    cb();
  }

  return through2.obj(bufferContents, endStream);
}

module.exports = polymerIconset;
