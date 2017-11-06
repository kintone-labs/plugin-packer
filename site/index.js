'use strict';

require('setimmediate'); // polyfill
const Buffer = require('buffer').Buffer;
const rezip = require('./rezip');
const packer = require('../src/');

/**
 * @param {string} selector
 * @param {function(new: T, ...*)} type
 * @return {!T}
 * @template T
 */
function $(selector, type) {
  type = type || Element;
  const el = document.querySelector(selector);
  if (!el) throw new Error(`element not found: ${selector}`);
  return assertInstanceof(el, type);
}

/**
 * @param {string} selector
 * @return {!Element}
 */
function $e(selector) {
  return $(selector, Element);
}

/** @type {ArrayBuffer} */
let contents;
/** @type {string} */
let privateKey;

/**
 * @param {*} value
 * @param {function(new: T, ...*)} type
 * @return {!T}
 * @template T
 */
function assertInstanceof(value, type) {
  if (value instanceof type) {
    return value;
  }
  throw new Error('the value is not instance of the type');
}

/**
 * @param {T|null|undefined} value
 * @return {!T}
 * @template T
 */
function assertNotNull(value) {
  if (value != null) {
    return value;
  }
  throw new Error('the value is not instance of the type');
}

$('#input .contents', HTMLInputElement).addEventListener('change', function(event) {
  const file = assertNotNull(this.files)[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    contents = reader.result;
    generatePlugin();
  };
  reader.readAsArrayBuffer(file);
});

$('#input .ppk', HTMLInputElement).addEventListener('change', function(event) {
  const file = assertNotNull(this.files)[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    privateKey = reader.result;
    generatePlugin();
  };
  reader.readAsText(file);
});

function generatePlugin() {
  if (!contents) {
    return Promise.resolve();
  }
  return rezip(Buffer.from(contents))
    .then(contentsZip => packer(contentsZip, privateKey))
    .then(output => {
      console.log('result', output.id);
      outputResult(output, !!privateKey);
    }).catch(e => {
      console.error(e);
      outputError(e);
    });
}

/**
 * @param {any} output
 * @param {boolean} hasPrivateKey
 */
function outputResult(output, hasPrivateKey) {
  $e('#output-error').classList.add('hide');
  $e('#output').classList.remove('hide');
  $e('#output .id').textContent = output.id;
  $('#output .plugin', HTMLAnchorElement).href = URL.createObjectURL(new Blob([output.plugin], {type: 'application/zip'}));
  if (hasPrivateKey) {
    $e('#output .ppk-item').classList.add('hide');
  } else {
    $e('#output .ppk-item').classList.remove('hide');
    $('#output .ppk', HTMLAnchorElement).href = URL.createObjectURL(new Blob([output.privateKey], {type: 'text/plain'}));
  }
}

/**
 * @param {any} e
 */
function outputError(e) {
  $e('#output').classList.add('hide');
  $e('#output-error').classList.remove('hide');
  /**
   * @type {any[]}
   */
  let errors = e.validationErrors;
  if (!e.validationErrors) {
    errors = [e.message];
  }
  const ul = $e('#output-error .messages');
  ul.innerHTML = '';
  errors.forEach(error => {
    const li = document.createElement('li');
    li.textContent = error;
    ul.appendChild(li);
  });
}
