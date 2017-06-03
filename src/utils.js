'use strict';

const D3Node = require('d3-node');
const MovesCleaner = require('@claygregory/moves-cleaner');

const fs = require('fs-extra');
const svg2png = require('svg2png');
const _ = require('lodash');

const utils = {};

utils.createD3n = function(options) {

  const d3n = new D3Node();
  const svg = d3n.createSVG(options.width, options.height);

  return {
    d3n: d3n,
    d3: d3n.d3,
    svg: svg
  };
};

utils.loadStoryline = function(path) {
  const storyline = fs.readJsonSync(path);

  const segments = _.flatMap(storyline, d => d.segments);
  const movesCleaner = new MovesCleaner();
  return movesCleaner.apply(segments);
};

utils.writeOutput = function(d3nContext, output, options) {

  let svgBuffer = new Buffer(d3nContext.svgString(), 'utf-8');

  if (!output.endsWith(options.format))
    output = `${output}.${options.format}`;

  if (options.format === 'svg') {
    fs.writeFileSync(output, svgBuffer);
  } else if (options.format === 'png') {
    const pngBuffer = svg2png.sync(svgBuffer);
    fs.writeFileSync(output, pngBuffer);
  } else {
    throw new Error(`Unsupported output format: ${options.format}`);
  }

};


module.exports = utils;