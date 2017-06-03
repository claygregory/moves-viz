#!/usr/bin/env node

'use strict';

const resources = require('./resources');
const _ = require('lodash');

require('yargs')
  .commandDir('commands')
  .demandCommand()

  .describe('height', 'Output image height')
  .number('height')
  .default('height', 800)

  .describe('width', 'Output image width')
  .number('width')
  .default('width', 1600)

  .describe('format', 'Output file format')
  .choices('format', ['png', 'svg'])
  .default('format', 'png')

  .describe('theme', 'Select theme')
  .choices('theme', _.keys(resources.themes()))
  .default('theme', 'default')

  .help()
  .wrap(200)
  .argv;