'use strict';

const revokeDownloadUrl = url => URL.revokeObjectURL(url);

const createDownloadUrl = (data, type) => URL.createObjectURL(
  new Blob([data], {type})
);

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
