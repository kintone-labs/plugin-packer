'use strict';

const {createDownloadUrls} = require('./dom');

const createInitialState = () => ({
  contents: {
    data: null,
    name: null,
  },
  ppk: {
    data: null,
    name: null,
  },
  plugin: {
    id: null,
    url: {
      contents: null,
      ppk: null,
    },
  },
  error: null,
  loading: false,
});

const resetPlugin = state => (
  Object.assign({}, state, {
    plugin: {
      id: null,
      url: {
        contents: null,
        ppk: null,
      },
    },
  })
);

const setError = (state, error) => Object.assign({}, state, {error});
const setPlugin = (state, result) => Object.assign({}, state, {
  ppk: {
    data: result.privateKey,
    name: state.ppk.name || `${result.id}.ppk`,
  },
  plugin: {
    id: result.id,
    url: createDownloadUrls(result),
  },
});
const setContents = (state, contents) => Object.assign({}, state, {contents});
const startLoading = state => Object.assign({}, state, {loading: true});
const resetError = state => Object.assign({}, state, {error: null});
const finishLoading = state => Object.assign({}, state, {loading: false});

const startCreatingPlugin = state => startLoading(
  resetError(
    resetPlugin(
      state
    )
  )
);
const startUploadPPK = (state, ppk) => Object.assign({}, state, {ppk});
const startUploadZip = state => resetError(
  Object.assign({}, state, {
    contents: {
      data: null,
      name: null,
    },
  }));

module.exports = {
  createInitialState,
  finishLoading,
  setError,
  setPlugin,
  startCreatingPlugin,
  startUploadPPK,
  startUploadZip,
  setContents,
};
