'use strict';

const flatten = require('array-flatten');

/**
 * Revoke an object URL
 * @param {string} url
 * @return {void}
 */
const revokeDownloadUrl = url => URL.revokeObjectURL(url);

/**
 * Create an object URL for the data
 * @param {*} data
 * @param {string} type
 * @return {string}
 */
const createDownloadUrl = (data, type) => URL.createObjectURL(new Blob([data], {type}));

const isDropEvent = e => e.type === 'drop';

const readEntries = entry =>
  new Promise(resolve => {
    if (entry.isDirectory) {
      entry.createReader().readEntries(childEntries => {
        Promise.all(childEntries.map(childEntry => readEntries(childEntry))).then(resolve);
      });
    } else {
      entry.file(file => resolve({file, fullPath: entry.fullPath}));
    }
  });

const getFileFromEvent = e => {
  if (!isDropEvent(e)) {
    return Promise.resolve(e.target.files[0]);
  }
  if (
    typeof e.dataTransfer.items === 'undefined' ||
    typeof e.dataTransfer.items[0].webkitGetAsEntry !== 'function'
  ) {
    return Promise.resolve(e.dataTransfer.files[0]);
  }
  return new Promise(resolve => {
    const entry = e.dataTransfer.items[0].webkitGetAsEntry();
    if (entry.isFile) {
      entry.file(resolve);
    } else {
      readEntries(entry).then(entries => {
        resolve(entries);
      });
    }
  });
};

/**
 * Create an handler for an event to convert a File
 * @param {function(file: File): Promise<*>} cb
 * @return {function(e: Event)}
 */
const createFileHanlder = cb => e => {
  getFileFromEvent(e).then(file => {
    const files = Array.isArray(file) ? flatten(file) : file;
    if (!files) {
      throw new Error('Can not create the file object');
    }
    cb(files);
  });
  if (isDropEvent(e)) {
    e.preventDefault();
  }
};

/**
 * Read a file and return it as an text
 * @param {File} file
 * @return {Promise<string>}
 */
const readText = file =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  });

/**
 * Read a file and return it as an array buffer
 * @param {File} file
 * @return {Promise<ArrayBuffer>}
 */
const readArrayBuffer = file =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
/**
 * register an event handler
 * @param {HTMLElement|NodeList} el
 * @param {*} args
 */
const listen = (el, ...args) => {
  if (el instanceof NodeList) {
    el.forEach(e => listen(...[e, ...args]));
    return;
  }
  el.addEventListener(...args);
};

module.exports = {
  $,
  $$,
  listen,
  revokeDownloadUrl,
  createDownloadUrl,
  createFileHanlder,
  readText,
  readArrayBuffer,
};
