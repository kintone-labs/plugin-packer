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
  /** @type {!Array<string>} */
  const list = sourceTypes
    .map(t => manifest[t[0]] && manifest[t[0]][t[1]])
    .filter(i => !!i)
    .reduce((a, b) => a.concat(b), []);
  if (manifest.config && manifest.config.html) {
    list.push(manifest.config.html);
  }
  list.push('manifest.json', manifest.icon);
  return list.filter(file => !/^https?:\/\//.test(file));
}

module.exports = sourceList;
