'use strict';

require('util.promisify/shim')();

const path = require('path');
const util = require('util');
const yazl = require('yazl');
const yauzl = require('yauzl');
const validate = require('@teppeis/kintone-plugin-manifest-validator');
const streamBuffers = require('stream-buffers');
const bind = require('bind.ts').default;

const genErrorMsg = require('../src/gen-error-msg');
const sourceList = require('../src/sourcelist');

// only for typings in JSDoc
// eslint-disable-next-line no-unused-vars
const ZipFile = yauzl.ZipFile;
// eslint-disable-next-line no-unused-vars
const Entry = yauzl.Entry;

/**
 * Extract, validate and rezip contents.zip
 *
 * @param {!Buffer} contentsZip The zipped plugin contents directory.
 * @return {!Promise<!Buffer>}
 */
function rezip(contentsZip) {
  return zipEntriesFromBuffer(contentsZip)
    .then(result => {
      const manifestList = Array.from(result.entries.keys())
        .filter(file => path.basename(file) === 'manifest.json');
      if (manifestList.length === 0) {
        throw new Error('The zip file has no manifest.json');
      } else if (manifestList.length > 1) {
        throw new Error('The zip file has many manifest.json files');
      }
      result.manifestPath = manifestList[0];
      const manifestEntry = result.entries.get(result.manifestPath);
      if (!manifestEntry) throw new Error(`Entry is not found for ${result.manifestPath}`);
      return getManifestJsonFromEntry(result.zipFile, manifestEntry)
        .then(json => Object.assign(result, {manifestJson: json}));
    })
    .then(result => {
      const manifestPrefix = path.dirname(result.manifestPath);
      validateManifest(result.entries, result.manifestJson, manifestPrefix);
      return rezipContents(result.zipFile, result.entries, result.manifestJson, manifestPrefix);
    });
}

/**
 * @typedef {Object} RezipResult
 * @property {!ZipFile} zipFile
 * @property {!Map<string, !Entry>} entries
 * @property {string} manifestPath
 */

/**
 * @param {!Buffer} contentsZip
 * @return {!Promise<!RezipResult>}
 */
function zipEntriesFromBuffer(contentsZip) {
  return util.promisify(yauzl.fromBuffer)(contentsZip)
    .then(zipFile => new Promise((res, rej) => {
      /** @type {!Map<string, !Entry>} */
      const entries = new Map();
      const result = {
        zipFile: zipFile,
        entries: entries,
      };
      zipFile.on('entry', entry => {
        entries.set(entry.fileName, entry);
      });
      zipFile.on('end', () => {
        res(result);
      });
      zipFile.on('error', rej);
    }));
}

/**
 * @param {!ZipFile} zipFile
 * @param {!Entry} zipEntry
 * @return {!Promise<string>}
 */
function zipEntryToString(zipFile, zipEntry) {
  return new Promise((res, rej) => {
    zipFile.openReadStream(zipEntry, (e, stream) => {
      if (e) return rej(e);
      const output = new streamBuffers.WritableStreamBuffer();
      output.on('finish', () => {
        res(output.getContents().toString('utf8'));
      });
      stream.pipe(output);
    });
  });
}

/**
 * @param {!ZipFile} zipFile
 * @param {!Entry} zipEntry
 * @return {!Promise<string>}
 */
function getManifestJsonFromEntry(zipFile, zipEntry) {
  return zipEntryToString(zipFile, zipEntry).then(str => JSON.parse(str));
}

/**
 * @param {!Map<string, !Entry>} entries
 * @param {!Object} manifestJson
 * @param {string} prefix
 * @throws if manifest.json is invalid
 */
function validateManifest(entries, manifestJson, prefix) {
  const result = validate(manifestJson, {
    /**
     * @param {string} filePath
     * @return {boolean}
     */
    relativePath: filePath => entries.has(path.join(prefix, filePath)),
    /**
     * @param {number} maxBytes
     * @param {string} filePath
     * @return {boolean}
     */
    maxFileSize(maxBytes, filePath) {
      const entry = entries.get(path.join(prefix, filePath));
      if (entry) {
        return entry.uncompressedSize <= maxBytes;
      }
      return false;
    },
  });

  if (!result.valid) {
    const errors = genErrorMsg(result.errors);
    // Need to extend Error class, but IE11 cannot exnted builtin...
    /** @type {JSONSchemaError} */
    const e = new Error(errors.join(', '));
    e.validationErrors = errors;
    throw e;
  }
}

/**
 * @param {!ZipFile} zipFile
 * @param {!Map<string, !Entry>} entries
 * @param {!Object} manifestJson
 * @param {string} prefix
 * @return {!Promise<!Buffer>}
 */
function rezipContents(zipFile, entries, manifestJson, prefix) {
  return new Promise((res, rej) => {
    const newZipFile = new yazl.ZipFile();
    newZipFile.on('error', rej);
    const output = new streamBuffers.WritableStreamBuffer();
    output.on('finish', () => {
      res(output.getContents());
    });
    newZipFile.outputStream.pipe(output);
    const openReadStream = util.promisify(bind(zipFile.openReadStream, zipFile));
    Promise.all(sourceList(manifestJson).map(src => {
      const entry = entries.get(path.join(prefix, src));
      if (!entry) throw new Error(`Entry is not found for ${src}`);
      return openReadStream(entry).then(stream => {
        newZipFile.addReadStream(stream, src, {size: entry.uncompressedSize});
      });
    })).then(() => {
      newZipFile.end();
    });
  });
}

module.exports = rezip;
