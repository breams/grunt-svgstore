/*
 * grunt-svgstore
 * https://github.com/FWeinb/grunt-svgstore
 *
 * Copyright (c) 2014 Fabrice Weinberg
 * Licensed under the MIT license.
 */
'use strict';

module.exports = function (grunt) {
  var crypto = require('crypto');
  var multiline = require('multiline');
  var path = require('path');

  var beautify = require('js-beautify').html;
  var cheerio = require('cheerio');
  var chalk = require('chalk');

  var md5 = function (str) {
    return crypto.createHash('md5').update(str).digest('hex');
  };

  var convertNameToId = function( name ){
    var dotPos = name.indexOf('.');
    if ( dotPos > -1){
      name = name.substring(0, dotPos);
    }
    return name;
  };

  // Matching an url() reference. To correct references broken by making ids unique to the source svg
  var urlPattern = /url\(\s*#([^ ]+?)\s*\)/g;

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('svgstore', 'Merge SVGs from a folder.', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    var defaultOpts = {
      prefix: '',
      svg: {
          "version": "1.1",
          "xmlns": "http://www.w3.org/2000/svg",
          "xmlns:xlink": "http://www.w3.org/1999/xlink"
      },
      formatting: false,
      includedemo: false,
      forceCloseTags: [],
      includeDesc: true,
      includeTitle: true,
      includeViewBox: true,
      insertIntoDefs: false,
      demoLocation: "",
      demoTemplate: "",
      demoTitle: "",
      demoFormatting: false,
      symbol: {}
    };
    var taskOpts = grunt.config([this.name, 'options']) || {};
    var targetOpts = grunt.config([this.name, this.target, 'options']) || {};
    var options = grunt.util._.merge({}, defaultOpts, taskOpts, targetOpts);

    this.files.forEach(function (file) {
      var $resultDocument = cheerio.load('<svg><defs></defs></svg>', { lowerCaseAttributeNames : false }),
          $resultSvg = $resultDocument('svg'),
          $resultDefs = $resultDocument('defs').first(),
          $svgContainer = (options.insertIntoDefs) ? $resultDefs : $resultSvg,
          iconNameViewBoxArray = [];  // Used to store information of all icons that are added
                                      // { name : '' }

      // Merge in SVG attributes from option
      for (var attr in options.svg) {
        $resultSvg.attr(attr, options.svg[attr]);
      }

      file.src.filter(function (filepath) {
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('File "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function (filepath) {
        var filename = path.basename(filepath, '.svg');
        var contentStr = grunt.file.read(filepath);
        var uniqueId = md5(contentStr);
        var $ = cheerio.load(contentStr, {
              normalizeWhitespace: true,
              xmlMode: true
            });

        // Map to store references from id to uniqueId + id;
        var mappedIds = {};

        // Make IDs unique
        $('[id]').each(function () {
          var $elem = $(this);
          var id = $elem.attr('id');
          var newId = 'svgstore' + uniqueId + id;
          mappedIds[id] = newId;
          $elem.attr('id', newId);
        });

        // Search for an url() reference in every attribute of every tag
        // replace the id with the unique one.
        $('*').each(function () {
          var $elem = $(this);
          var attrs = $elem.attr();
          Object.keys(attrs).forEach(function (key) {
            var value = attrs[key];
            var match;
            while ((match = urlPattern.exec(value)) !== null) {
              if (mappedIds[match[1]] !== undefined) {
                value = value.replace(match[0], 'url(#' + mappedIds[match[1]] + ')');
              } else {
                grunt.log.warn('Can\'t reference to id "' + match[1] + '" from attribute "' + attr + '" in "' + this[0].name + '" because it is not defined.');
              }
            }
            if (options.cleanup && key === 'style') {
              value = null;
            }
            $elem.attr(key, value);
          });
        });

        var $svg = $('svg');
        var $title = $('title');
        var $desc = $('desc');
        var $def = $('defs').first();
        var defContent = $def.length && $def.html();

        // Merge in the defs from this svg in the result defs block
        if (defContent) {
          $resultDefs.append(defContent);
        }

        var title = $title.first().html();
        var desc = $desc.first().html();

        // Remove def, title, desc from this svg
        $def.remove();
        $title.remove();
        $desc.remove();

        var id = convertNameToId(filename);

        // Generate symbol

        // If svg has <g> children wrapping paths
        $svg.children('g').each(function() {
          var $this = $(this);
          $this.replaceWith($this.children());
        });

        var svgHtml = $svg.html().replace(/\r\n|\r|\n|\t/gm, "").trim();

        var $res = cheerio.load('<symbol>' + svgHtml + '</symbol>', { lowerCaseAttributeNames: false });
        var $symbol = $res('symbol').first();

        // Merge in symbol attributes from option
        for (var attr in options.symbol) {
          $symbol.attr(attr, options.symbol[attr]);
        }

        // Add title and desc (if provided)
        if (options.includeDesc) {
          if (desc) {
            $symbol.prepend('<desc>' + desc + '</desc>');
          }
        }

        if (options.includeTitle) {
          // If there is no title use the filename
          title = title || id;

          if (title) {
            $symbol.prepend('<title>' + title + '</title>');
          }
        }

        // Add viewBox (if present of SVG)
        if (options.includeViewBox) {
          var viewBox = $svg.attr('viewBox');
          if (viewBox) {
            $symbol.attr('viewBox', viewBox);
          }
        }

        // Add ID to symbol
        var graphicId = options.prefix + id;
        $symbol.attr('id', graphicId);

        // Append <symbol> to resulting SVG
        $svgContainer.append($res.html());

        // Add icon to the demo.html array
        if (options.includedemo) {
          iconNameViewBoxArray.push({
            name: graphicId
          });
        }
      });

      // Remove defs block if empty
      if ( $resultDefs.html().trim() === '' ) {
        $resultDefs.remove();
      }

      var resultXML = $resultDocument.xml();
      // Process any tags flagged for closing
      for (var i = 0, len = options.forceCloseTags.length; i < len; i++) {
        var re = new RegExp("<(" + options.forceCloseTags[i] + ") ([^>]+)\/>", "g");
        resultXML = resultXML.replace(re, "<$1 $2></$1>");
      }
      resultXML = options.formatting ? beautify(resultXML, options.formatting) : resultXML;
      var destName = path.basename(file.dest, '.svg');

      grunt.file.write(file.dest, resultXML);

      grunt.log.writeln('File ' + chalk.cyan(file.dest) + ' created.');

      if (options.includedemo) {
        $resultSvg.attr('style', 'width:0;height:0;visibility:hidden;');

        var demoHTML = (options.demoTemplate && grunt.file.isFile(options.demoTemplate)) ? grunt.file.read(options.demoTemplate) : multiline.stripIndent(function () { /*
                <!doctype html>
                <html>
                  <head>
                    <style>
                      svg{
                          width:50px;
                          height:50px;
                          fill:black !important;
                      }
                    </style>
                  <head>
                  <body>
                    {{svg}}
                    {{useBlock}}
                  </body>
               </html>
              */});

        var useBlock = '';
        iconNameViewBoxArray.forEach(function (item) {
          useBlock += '<svg class="' + item.name + '"><use xlink:href="#' + item.name + '"></use></svg>\n';
        });

        demoHTML = demoHTML.replace('{{svg}}', resultXML);
        demoHTML = demoHTML.replace('{{useBlock}}', useBlock);
        demoHTML = demoHTML.replace(/{{svgFilename}}/g, destName);
        demoHTML = demoHTML.replace(/{{title}}/g, (options.demoTitle) ? options.demoTitle : destName.charAt(0).toUpperCase() + destName.substr(1) + " Demo");

        if (options.demoFormatting) {
          demoHTML = beautify(demoHTML, options.demoFormatting);
        }
        var demoPath = '';
        if (options.demoLocation) {
          demoPath = path.resolve(options.demoLocation, destName + '.html');
        } else {
          demoPath = path.resolve(path.dirname(file.dest), destName + '-demo.html');
        }
        grunt.file.write(demoPath, demoHTML);
        grunt.log.writeln('Demo file ' + chalk.cyan(demoPath) + ' created.');
      }
    });
  });
};
