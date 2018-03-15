// @ts-check

'use strict';

/**
 * Create content file list from manifest.json
 *
 * @param {!Object} manifest
 * @return {!Array<string>}
 */
function sourceList(manifest) {
  const sourceTypes = [
    ['desktop', 'js'],
    ['desktop', 'css'],
    ['mobile', 'js'],
    ['config', 'js'],
    ['config', 'css'],
  ];
  /** @type {Array<string>} */
  const list = sourceTypes
    .map(([type, ext]) => manifest[type] && manifest[type][ext])
    .filter(i => !!i)
    .reduce((a, b) => a.concat(b), []);
  const localSources = list.filter(file => !/^https?:\/\//.test(file));
  if (manifest.config && manifest.config.html) {
    localSources.push(manifest.config.html);
  }
  localSources.push('manifest.json', manifest.icon);
  return localSources;
}

module.exports = sourceList;
