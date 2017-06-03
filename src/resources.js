
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const resources = {};

const require_json_defaults = {
  extensions: ['.json', '.topojson']
};
resources.requireJson = function(relativePath, options) {

  options = _.defaults({}, options, require_json_defaults);

  const jsons = {};
  fs.readdirSync(path.join(__dirname, relativePath)).forEach(filename => {

    const parsedFilename = path.parse(filename);
    if (options.extensions && !_.includes(options.extensions, parsedFilename.ext))
      return;

    jsons[parsedFilename.name] = fs.readJsonSync(path.join(__dirname, relativePath, filename));
  });

  return jsons;
};

resources.maps = function(map) {

  let maps = this.topojson;
  if (maps === undefined)
    maps = this.topojson = resources.requireJson('../maps');

  return map === undefined ? maps : maps[map];
};

resources.themes = function(theme) {

  let themes = this.json;
  if (themes === undefined)
    themes = this.json = resources.requireJson('../themes');

  return theme === undefined ? themes : themes[theme];
};

module.exports = resources;