# grunt-svgstore [![NPM version](https://badge.fury.io/js/grunt-svgstore.svg)](http://badge.fury.io/js/grunt-svgstore) [![Build Status](https://travis-ci.org/FWeinb/grunt-svgstore.svg?branch=master)](https://travis-ci.org/FWeinb/grunt-svgstore)

> Merge SVGs from a folder.

## Why?
Because [Chris Coyer](http://shoptalkshow.com/episodes/103-louis-lazaris/#t=33:52) asked.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-svgstore --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-svgstore');
```

## The "svgstore" task

### Overview
In your project's Gruntfile, add a section named `svgstore` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  svgstore: {
    options: {
      prefix : 'icon-', // This will prefix each ID
      svg: { // will be added as attributes to the resulting SVG
        viewBox : '0 0 100 100'
      }
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.prefix
Type: `String`
Default value: `''`

A string value that is used to prefix each filename to generate the id.

#### options.svg
Type: `Object`
Default value: `{}`

An object that is used to generate attributes for the resulting `svg` file.
```js
{
  viewBox: '0 0 100 100'
}
```
will result in:

```svg
<svg viewBox="0 0 100 100">
[...]
```

#### options.symbol (since 0.2.4)
Type: `Object`
Default value: `{}`

Just like `options.svg` but will add attributes to each generated `<symbol>`.


#### options.formatting (since 0.0.4)
Type: `Object` or `boolean`
Default value: `false`

Formatting options for generated code.

To format the generated HTML, set `formatting` with [options](https://github.com/einars/js-beautify#options) like: `{indent_size : 2}`, which in context looks like:

```js
default: {
  options: {
    formatting : {
      indent_size : 2
    }
  }
```
See [js-beautify](https://github.com/einars/js-beautify) for more options.

#### options.includedemo (since 0.1.0)
Type: `boolean`
Default value: `false`

This will include a demo HTML (named like `destName + -demo.html`) from where you can copy your `<use>` blocks.

#### options.cleanup (since 0.2.6)
Type: `boolean`
Default value: `false`

Clean up all inline style definitions that may jeopardise later stylesheet-based colouring (`fill`).

#### options.forceCloseTags (since 0.2.7-1)
Type: `array`
Default value: `[]`

Provide an array of tag names (eg. `['path', 'use']`) that require a closing tag (may be required for IE compatibility).

#### options.includeDesc (since 0.2.7-1)
Type: `boolean`
Default value: `true`

Include the `desc` tag when generating `<symbol>`s.

#### options.includeTitle (since 0.2.7-1)
Type: `boolean`
Default value: `true`

Include the `title` tag when generating `<symbol>`s.

#### options.includeViewBox (since 0.2.7-1)
Type: `boolean`
Default value: `true`

Include the `viewBox` when generating `<symbol>`s.

#### options.insertIntoDefs (since 0.2.7-1)
Type: `boolean`
Default value: `false`

Put all of the `<symbol>`s inside one large `<defs>` block (for loading as sprites and later usage with `<use>` blocks).

#### options.demoLocation (since 0.2.7-2)
Type: `string`
Default value: `""`

Path for the generated demo (defaults to same path as generated files).

#### options.demoTemplate (since 0.2.7-2)
Type: `string`
Default value: `""`

An external file to be used for demo template HTML.

#### options.demoTitle (since 0.2.7-2)
Type: `string`
Default value: `""`

Text for the demo page's `title` and `h1` (if included in the template).

#### options.demoFormatting (since 0.2.7-2)
Type: `Object` or `boolean`
Default value: `false`

Formatting options for beautifying the generated demo HTML (same syntax as [options.formatting](#options.formatting) )

See [js-beautify](https://github.com/einars/js-beautify) for full options.

### Usage Examples

This example will merge all elements from the `svgs` folder into the `<defs>`-Block of the `dest.svg`. You can use that SVG in HTML like:

```html
<!-- Include dest.svg -->

[...]

<svg><use xlink:href="#filename" /></svg>
````

```js
grunt.initConfig({
  svgstore: {
    options: {},
    default : {
      files: {
        'dest/dest.svg': ['svgs/*.svg'],
      },
    },
  },
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

#### 0.2.7-2
* Add `options.demoLocation` to provide a path for the generated demo.
* Add `options.demoTemplate` to specify an external file for demo template HTML.
* Add `options.demoTitle` to provide text for the demo page's `title` and `h1` (if included in the template).
* Add `options.demoFormatting` to include formatting options for beautifying the generated demo HTML.

#### 0.2.7-1
* Add `options.forceCloseTags` to provide an array of tag names that require a closing tag.
* Add `options.includeDesc` to toggle inclusion of `desc` tag when generating `<symbol>`s.
* Add `options.includeTitle` to toggle inclusion of `title` tag when generating `<symbol>`s.
* Add `options.includeViewBox` to toggle inclusion of `viewBox` when generating `<symbol>`s.
* Add `options.insertIntoDefs` to toggle putting all of the `<symbol>`s inside one large `<defs>` block.

#### 0.2.7
  * Don't generate IDs that start with a number by prefixing them with `svgstore`. (Thanks to [#38](https://github.com/FWeinb/grunt-svgstore/pull/38))

#### 0.2.6
  * Add `options.clean` to remove inline styles from source svgs. (Thanks to [ain](https://github.com/FWeinb/grunt-svgstore/pull/37))
  * Reformat source to use 2 spaces for indentation (Fix [#36](https://github.com/FWeinb/grunt-svgstore/issues/36))

#### 0.2.5
  * To generate the id from the filename is now used as a title. (Fix [#33](https://github.com/FWeinb/grunt-svgstore/issues/33))

#### 0.2.4
  * Added `options.symbol` to add attributes to generated `<symbol>`s ([#30](https://github.com/FWeinb/grunt-svgstore/pull/30))
  * To generate the id from the filename the name is now cut right before the first dot. `name.min.svg` becomes `name`. (Fixes [#29](https://github.com/FWeinb/grunt-svgstore/issues/29))

#### 0.2.3
  * Fixed lower case `viewBox` in outputted svg (fix [#26](https://github.com/FWeinb/grunt-svgstore/issues/26))

#### 0.2.2
  * Fixed a bug where self-closing elements where nested.

#### 0.2.1
  * Move `<symbol>`-tag out of `<defs>`-tag (see the [spec](http://www.w3.org/TR/SVG11/struct.html#SymbolElement))
  * Only create `<defs>`-tag if needed (e.g.  `<linearGradient>` is used)

#### 0.2.0
  * Use a `<symbol>`-tag for representing icons (See [TxHawks Comment](https://github.com/FWeinb/grunt-svgstore/issues/16#issuecomment-43786059).)
  * Write the `viewBox` attribute to the `<symbol>`-tag,
  * Include `title` and `desc` elements in the generated svg for each `<symbol>`
  * use 'filename' as a fallback for `title`
  * Fix issue [#1](https://github.com/FWeinb/grunt-svgstore/issues/1)

#### 0.1.0
  * Always add `xmlns` namspace.
  * Added the `includedemo` option.
  * Fixed Issues [#20](https://github.com/FWeinb/grunt-svgstore/issues/20), [#19](https://github.com/FWeinb/grunt-svgstore/issues/19), [#18](https://github.com/FWeinb/grunt-svgstore/issues/18)

#### 0.0.4
  * Fixed issue with referencing ids with `url()` (fix [#12](https://github.com/FWeinb/grunt-svgstore/issues/12))

#### 0.0.3
  * Added `options.formatting` to format svg via [js-beautify](https://github.com/einars/js-beautify)

#### 0.0.2
  * Fixed npm dependencies

#### 0.0.1
  * Inital release
