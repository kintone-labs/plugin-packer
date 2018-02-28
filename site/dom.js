'use strict';

const revokePluginUrls = plugin => {
  Object.keys(plugin.url).forEach(key => {
    URL.revokeObjectURL(plugin.url[key]);
  });
};

const createDownloadUrls = result => ({
  contents: URL.createObjectURL(
    new Blob([result.plugin], {type: 'application/zip'})
  ),
  ppk: URL.createObjectURL(
    new Blob([result.privateKey], {type: 'text/plain'})
  ),
});

const isDropEvent = e => e.type === 'drop';
const getFileFromEvent = e => (
  isDropEvent(e) ?
    e.dataTransfer.files[0] :
    e.target.files[0]
);

const createFileHanlder = cb => e => {
  const file = getFileFromEvent(e);
  if (!file) {
    return;
  }
  if (isDropEvent(e)) {
    e.preventDefault();
  }
  return cb(file);
};

const readText = file => (
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsText(file);
  })
);

const readArrayBuffer = file => (
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  })
);

// utils for DOM API
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const listen = (el, ...args) => {
  if (el instanceof NodeList) {
    el.forEach(e => listen(...[e, ...args]));
    return;
  }
  el.addEventListener(...args);
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  $,
  $$,
  listen,
  delay,
  revokePluginUrls,
  createDownloadUrls,
  createFileHanlder,
  readText,
  readArrayBuffer,
};
