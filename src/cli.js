'use strict';

const path = require('path');
const fs = require('fs');
const ZipFile = require('yazl').ZipFile;
const denodeify = require('denodeify');
const writeFile = denodeify(fs.writeFile);
const nodeDir = require('node-dir');
const listFiles = denodeify(nodeDir.files);
const streamBuffers = require('stream-buffers');
const debug = require('debug')('cli');
const validate = require('@teppeis/kintone-plugin-manifest-validator');

const packer = require('./');
const generateErrorMessages = require('./gen-error-msg');

/**
 * @param {string} pluginDir path to plugin directory.
 * @param {Object=} options {ppk: string}.
 * @return {!Promise<string>} The resolved value is a path to the output plugin zip file.
 */
function cli(pluginDir, options) {
  options = options || {};
  const packerLocal = options.packerMock_ ? options.packerMock_ : packer;

  // 1. check if pluginDir is a directory
  if (!fs.statSync(pluginDir).isDirectory()) {
    throw new Error(`${pluginDir} should be a directory.`);
  }

  // 2. check pluginDir/manifest.json
  const manifestJsonPath = path.join(pluginDir, 'manifest.json');
  if (!fs.statSync(manifestJsonPath).isFile()) {
    throw new Error('Manifest file $PLUGIN_DIR/manifest.json not found.');
  }

  const manifest = loadJson(manifestJsonPath);
  const result = validate(manifest, {
    relativePath: validateRelativePath(pluginDir),
    maxFileSize: validateMaxFileSize(pluginDir),
  });
  debug(result);

  if (!result.valid) {
    const msgs = generateErrorMessages(result.errors);
    console.error('Invalid manifest.json:');
    msgs.forEach(msg => {
      console.error(`- ${msg}`);
    });
    throw new Error('Invalid manifest.json');
  }

  const outputDir = path.dirname(path.resolve(pluginDir));
  debug(`outDir : ${outputDir}`);

  return listFiles(pluginDir).then(files => {
    files.forEach(file => {
      const basename = path.basename(file);
      // 3. check dot files
      if (/^\./.test(basename)) {
        throw new Error(`PLUGIN_DIR must not contain dot files or directories : ${file}`);
      }
      // 4. check *.ppk
      if (/\.ppk$/.test(basename)) {
        throw new Error(`PLUGIN_DIR must not contain * .ppk : ${file}`);
      }
    });
  }).then(() => {
    // 5. generate new ppk if not specified
    const ppkFile = options.ppk;
    let privateKey;
    if (ppkFile) {
      debug(`loading an existing key: ${ppkFile}`);
      privateKey = fs.readFileSync(ppkFile, 'utf8');
    }

    // 6. package plugin.zip
    return createContentsZip(pluginDir, manifest)
      .then(contentsZip => packerLocal(contentsZip, privateKey))
      .then(output => {
        if (!ppkFile) {
          fs.writeFileSync(path.join(outputDir, `${output.id}.ppk`), output.privateKey, 'utf8');
        }
        return outputPlugin(outputDir, output.plugin);
      });
  });
}

module.exports = cli;

/**
 * Create contents.zip
 *
 * @param {string} pluginDir
 * @param {!Object} manifest
 * @return {!Promise<!Buffer>}
 */
function createContentsZip(pluginDir, manifest) {
  return new Promise((res, rej) => {
    const output = new streamBuffers.WritableStreamBuffer();
    const zipFile = new ZipFile();
    let size = null;
    output.on('finish', () => {
      debug(`plugin.zip: ${size} bytes`);
      res(output.getContents());
    });
    zipFile.outputStream.pipe(output);
    createSourceList(manifest).forEach(src => {
      zipFile.addFile(path.join(pluginDir, src), src);
    });
    zipFile.end(finalSize => {
      size = finalSize;
    });
  });
}

/**
 * Create content file list
 *
 * @param {!Object} manifest
 * @return {!Array<string>}
 */
function createSourceList(manifest) {
  const sourceTypes = [
    ['desktop', 'js'],
    ['desktop', 'css'],
    ['mobile', 'js'],
    ['config', 'js'],
    ['config', 'css']
  ];
  const list = ['manifest.json', manifest.icon];
  if (manifest.config && manifest.config.html) {
    list.push(manifest.config.html);
  }
  sourceTypes.forEach(t => {
    const category = t[0];
    const type = t[1];
    if (manifest[category]) {
      Array.prototype.push.apply(list, manifest[category][type]);
    }
  });
  const sourceList = [];
  list.forEach(src => {
    if (!/^https?:\/\//.test(src)) {
      sourceList.push(src);
    }
  });
  return sourceList;
}

/**
 * Create and save plugin.zip
 *
 * @param {string} outputDir
 * @param {!Buffer} plugin
 * @return {!Promise<string>} The value is output path of plugin.zip.
 */
function outputPlugin(outputDir, plugin) {
  const outputPath = path.join(outputDir, 'plugin.zip');
  return writeFile(outputPath, plugin)
    .then(arg => outputPath);
}

/**
 * Load JSON file without caching
 *
 * @param {sting} jsonPath
 * @return {Object}
 */
function loadJson(jsonPath) {
  const content = fs.readFileSync(jsonPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Return validator for `relative-path` format
 *
 * @param {string} pluginDir
 * @return {function(string): boolean}
 */
function validateRelativePath(pluginDir) {
  return str => {
    try {
      const stat = fs.statSync(path.join(pluginDir, str));
      return stat.isFile();
    } catch (e) {
      return false;
    }
  };
}

/**
 * Return validator for `maxFileSize` keyword
 *
 * @param {string} pluginDir
 * @return {function(string, string): boolean}
 */
function validateMaxFileSize(pluginDir) {
  return (maxBytes, filePath) => {
    try {
      const stat = fs.statSync(path.join(pluginDir, filePath));
      return stat.size <= maxBytes;
    } catch (e) {
      return false;
    }
  };
}
