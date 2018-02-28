'use strict';

require('setimmediate'); // polyfill
const {
  $,
  $$,
  listen,
  createFileHanlder,
} = require('./dom');
const {
  createInitialState,
} = require('./state');
const View = require('./view');
const {
  handleUploadedPPK,
  handleUploadedPluginZip,
  handleCreateBtn,
  handleClearBtn,
} = require('./handler');

const $ppkFileUploader = $('.js-upload-ppk .js-file-upload');
const $zipFileUploader = $('.js-upload-zip .js-file-upload');
const $$fileUploader = $$('.js-file-upload');

const $$UploadArea = $$('.js-upload');
const $zipDropArea = $('.js-upload-zip');
const $ppkDropArea = $('.js-upload-ppk');

const $createBtn = $('.js-create-btn');
const $createLoadingBtn = $('.js-create-loading-btn');
const $clearBtn = $('.js-clear-btn');

const $$fileUploaders = $$('.js-file-upload');

const $zipOkIcon = $('.js-zip-ok-icon');
const $ppkOkIcon = $('.js-ppk-ok-icon');

const $uploadZipLink = $('.js-upload-zip-link');
const $uploadPPKLink = $('.js-upload-ppk-link');

const $download = $('.js-download');
const $downloadPlugin = $('.js-download-plugin');
const $downloadPluginId = $('.js-download-plugin-id');
const $downloadPPK = $('.js-download-ppk');

const $error = $('.js-error');
const $errorMessages = $('.js-error-messages');

const $zipFileName = $('.js-zip-file-name');
const $ppkFileName = $('.js-ppk-file-name');

const view = new View({
  createLoadingBtn: $createLoadingBtn,
  createBtn: $createBtn,
  zipDropArea: $zipDropArea,
  ppkDropArea: $ppkDropArea,
  ppkOkIcon: $ppkOkIcon,
  error: $error,
  download: $download,
  downloadPluginId: $downloadPluginId,
  downloadPlugin: $downloadPlugin,
  downloadPPK: $downloadPPK,
  errorMessages: $errorMessages,
  zipOkIcon: $zipOkIcon,
  zipFileName: $zipFileName,
  ppkFileName: $ppkFileName,
});
let state = createInitialState();

const render = () => view.render(state);
const renderWithNewState = newState => {
  state = newState;
  render();
};

const uploadPluginZipHandler = createFileHanlder(file => {
  handleUploadedPluginZip(state, file).then(renderWithNewState);
});

const uploadPPKHanlder = createFileHanlder(file => {
  handleUploadedPPK(state, file, render).then(renderWithNewState);
});

// Handle a file upload
listen($zipFileUploader, 'change', uploadPluginZipHandler);
listen($ppkFileUploader, 'change', uploadPPKHanlder);
listen($zipDropArea, 'drop', uploadPluginZipHandler);
listen($ppkDropArea, 'drop', uploadPPKHanlder);
// Hack to allow us to reupload the same file
listen($$fileUploader, 'click', e => {
  e.target.value = null;
});

// Handle click a button
listen($createBtn, 'click', () => handleCreateBtn(state, renderWithNewState).then(renderWithNewState));
listen($clearBtn, 'click', () => handleClearBtn().then(newState => {
  $$fileUploaders.forEach(el => {
    el.value = null;
  });
  renderWithNewState(newState);
}));

// Handle a click for a select file
listen($uploadZipLink, 'click', e => {
  e.preventDefault();
  $zipFileUploader.click();
});
listen($uploadPPKLink, 'click', e => {
  e.preventDefault();
  $ppkFileUploader.click();
});

// Hanlde a drag and drop
listen($$UploadArea, 'dragover', e => {
  e.preventDefault();
  view.decorateDragOver(e.currentTarget);
});
listen($$UploadArea, 'dragleave', e => {
  view.decorateDragLeave(e.currentTarget);
});

render();
