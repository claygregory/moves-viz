'use strict';

const utils = require('../utils');
const resources = require('../resources');
const topojson = require('topojson');
const _ = require('lodash');

exports.command = 'map <input> <output>';
exports.desc = 'Generates a map from movements';
exports.builder = function (yargs) {
  
  yargs.describe('map-background', 'Select background map')
    .choices('map-background', _.keys(resources.maps()))
    .default('map-background', 'world');
};

exports.handler = function (options) {

  const segments = utils.loadStoryline(options.input);
  const moves = _.filter(segments, ['type', 'move']);

  const context = utils.createD3n(options);

  drawMap(context, moves, options);
  drawMoves(context, moves, options);

  utils.writeOutput(context.d3n, options.output, options);
};

function appendMovePath(svg, points) {

  const pointToCoord = point => [point.lon, point.lat];
  return svg.append('path')
    .datum({type: 'LineString', coordinates: _.map(points, pointToCoord) });
}

function createProjection(context, moves, options) {

  const lats = _.flatMap(moves, move => _.map(move.trackPoints, 'lat'));
  const lons = _.flatMap(moves, move => _.map(move.trackPoints, 'lon'));

  const topLeft = [_.min(lons), _.max(lats)];
  const bottomRight = [_.max(lons), _.min(lats)];

  const extent = { type: 'LineString', coordinates: [topLeft, bottomRight] };

  return context.d3.geoMercator()
    .fitExtent([[options.width * 0.05, options.height * 0.05], [options.width * 0.95, options.height * 0.95]], extent);
}

function drawMap(context, moves, options) {

  const theme = resources.themes(options.theme);

  const map = resources.maps(options['map-background']);
  const default_layer = _.keys(map.objects)[0];
  const geoMap = topojson.feature(map, map.objects[default_layer]);

  const projection = createProjection(context, moves, options);
  const geopath = context.d3.geoPath()
    .projection(projection);

  const colors = context.d3.scaleOrdinal(theme.background_colors)
    .domain(['background', 'stroke', 'fill']);

  context.svg.attr('style', `background-color: ${colors('background')}`);

  context.svg.append('path')
    .attr('class', 'map')
    .attr('stroke-linejoin', 'round')
    .attr('stroke-linecap', 'round')
    .attr('stroke', colors('stroke'))
    .attr('fill', colors('fill'))
    .datum(geoMap)
    .attr('d', geopath);
}

function drawMoves(context, moves, options) {

  const theme = resources.themes(options.theme);

  const activityColors = context.d3.scaleOrdinal(theme.forground_colors)
    .domain(_.chain(moves).map('activity').uniq().sort().value());

  const projection = createProjection(context, moves, options);
  const geopath = context.d3.geoPath()
    .projection(projection);

  _.each(moves, move => {
    let path;
    if (move.activity === 'airplane') {
      path = appendMovePath(context.svg, [_.first(move.trackPoints), _.last(move.trackPoints)]);
    } else {
      path = appendMovePath(context.svg, move.trackPoints);
    }

    path
      .attr('class', `move ${move.activity}`)
      .attr('fill', 'none')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-linecap', 'round')
      .attr('stroke', activityColors(move.activity))
      .attr('stroke-width', theme.stroke_width || 1)
      .attr('d', geopath);
  });
}