'use strict';

const D3Node = require('d3-node');
const MovesCleaner = require('@claygregory/moves-cleaner');

const fs = require('fs-extra');
const moment = require('moment');
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

utils.loadStoryline = function(path, options) {
  const storyline = fs.readJsonSync(path);

  let segments = _.flatMap(storyline, d => d.segments);
  const movesCleaner = new MovesCleaner();
  segments = movesCleaner.apply(segments);

  if (!_.isEmpty(options['start-date'])) {
    const start = moment(options['start-date']);
    segments = _.filter(segments, s => start.isBefore(s.endTime));
  }

  if (!_.isEmpty(options['end-date'])) {
    const end = moment(options['end-date']);
    segments = _.filter(segments, s => end.isAfter(s.startTime));
  }

  return segments;
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