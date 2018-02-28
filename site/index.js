'use strict';

require('setimmediate'); // polyfill
const {readText, readArrayBuffer} = require('./file');
const generatePlugin = require('./generatePlugin');

// utils for DOM API
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const listen = (el, ...args) => el.addEventListener(...args);

const createInitialState = () => ({
  contents: null,
  ppk: null,
  plugin: {
    id: null,
    url: {
      contents: null,
      ppk: null,
    },
  },
  error: null,
});

let state = createInitialState();

const createDownloadUrls = result => {
  Object.keys(state.plugin.url).forEach(key => {
    URL.revokeObjectURL(state.plugin.url[key]);
  });
  state.plugin.url.contents = URL.createObjectURL(
    new Blob([result.plugin], {type: 'application/zip'})
  );
  state.plugin.url.ppk = URL.createObjectURL(
    new Blob([result.privateKey], {type: 'text/plain'})
  );
};

const $ppkFileUploader = $('.js-upload-ppk .js-file-upload');
const $zipFileUploader = $('.js-upload-zip .js-file-upload');
const $UploadArea = $('.js-upload');
const $zipDropArea = $('.js-upload-zip');
const $ppkDropArea = $('.js-upload-ppk');
const $createBtn = $('.js-create-btn');
const $clearBtn = $('.js-clear-btn');
const $$fileUploaders = $$('.js-file-upload');
const $zipOkIcon = $('.js-zip-ok-icon');
const $ppkOkIcon = $('.js-ppk-ok-icon');

const handleUploadedPPK = e => {
  const file = e.target.files[0];
  if (!file) {
    return;
  }
  readText(file).then(text => {
    state.ppk = text;
    render(state);
  });
};

const handleUploadedPluginZip = e => {
  const isDrop = e.type === 'drop';
  const file = isDrop ?
    e.dataTransfer.files[0] :
    e.target.files[0];
  if (!file) {
    return;
  }
  // console.log(file);
  if (isDrop) {
    e.preventDefault();
  }
  readArrayBuffer(file).then(buffer => {
    state.contents = buffer;
    render(state);
  });
};

// Handle a file upload
listen($zipFileUploader, 'change', handleUploadedPluginZip);
listen($ppkFileUploader, 'change', handleUploadedPPK);

// Hanlde a drag and drop
listen($zipDropArea, 'drop', handleUploadedPluginZip);
listen($ppkDropArea, 'drop', handleUploadedPPK);
listen($UploadArea, 'dragover', e => {
  e.preventDefault();
  renderDragOver(e.currentTarget);
});
listen($UploadArea, 'dragleave', e => {
  renderDragLeave(e.currentTarget);
});

// Handle click a button
listen($createBtn, 'click', () => {
  if (!state.contents) return;
  generatePlugin(state.contents, state.ppk)
    .then(result => {
      state.plugin.id = result.id;
      createDownloadUrls(result);
    })
    .catch(error => {
      state.error = error;
    })
    .then(() => render(state));
});
listen($clearBtn, 'click', () => {
  state = createInitialState();
  render(state);
  $$fileUploaders.forEach(el => {
    el.value = null;
  });
});

const render = state => {
  renderResult(state);
  renderUploadPPKArea(state);
  renderUploadZipArea(state);
};

const renderDragOver = el => {
  el.style.backgroundColor = '#EEE';
};

const renderDragLeave = el => {
  el.style.backgroundColor = '#FFF';
};

const renderUploadZipArea = state => {
  renderDragLeave($zipDropArea);
  if (state.contents) {
    $createBtn.classList.remove('disabled');
    $zipOkIcon.classList.remove('hide');
  } else {
    $createBtn.classList.add('disabled');
    $zipOkIcon.classList.add('hide');
  }
};

const renderUploadPPKArea = () => {
  if (state.ppk) {
    $ppkOkIcon.classList.remove('hide');
  } else {
    $ppkOkIcon.classList.add('hide');
  }
};

const renderResult = state => {
  if (state.error) {
    renderErrorMessages(state);
  } else if (state.plugin.url.contents) {
    renderDownloadLinks(state);
  } else {
    $('#output').classList.add('hide');
  }
};

function renderDownloadLinks(state) {
  $('#output-error').classList.add('hide');
  $('#output').classList.remove('hide');
  $('#output .id').textContent = state.plugin.id;
  $('#output .plugin').href = state.plugin.url.contents;
  if (state.ppk) {
    $('#output .ppk').parentNode.classList.add('hide');
  } else {
    $('#output .ppk').parentNode.classList.remove('hide');
    $('#output .ppk').href = state.plugin.url.ppk;
  }
}

function renderErrorMessages(state) {
  $('#output').classList.add('hide');
  $('#output-error').classList.remove('hide');
  const e = state.error;
  let errors = e.validationErrors;
  if (!e.validationErrors) {
    errors = [e.message];
  }
  const ul = $('#output-error .messages');
  ul.innerHTML = '';
  errors.forEach(error => {
    const li = document.createElement('li');
    li.textContent = error;
    ul.appendChild(li);
  });
}
