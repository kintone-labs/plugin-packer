'use strict';

const generatePlugin = require('./generatePlugin');
const {
  readText,
  readArrayBuffer,
  revokePluginUrls,
  delay,
} = require('./dom');
const {
  startUploadPPK,
  startUploadZip,
  setContents,
  setError,
  setPlugin,
  finishLoading,
  startCreatingPlugin,
  createInitialState,
} = require('./reducer');

const handleUploadedPPK = (state, file) => readText(file)
  .then(text => {
    state = startUploadPPK(state, {data: text, name: file.name});
    return state;
  });

const handleUploadedPluginZip = (state, file) => readArrayBuffer(file)
  .then(buffer => {
    state = startUploadZip(state);
    return buffer;
  })
  // in order to validate the uploaded zip before submit
  .then(buffer => generatePlugin(buffer).then(() => buffer))
  .then(
    buffer => {
      state = setContents(state, {data: buffer, name: file.name});
    },
    error => {
      state = setError(state, error);
    }
  )
  .then(() => state);

const handleCreateBtn = (state, renderWithNewState) => {
  if (!state.contents.data) return Promise.resolve(state);

  revokePluginUrls(state.plugin);
  state = startCreatingPlugin(state);
  renderWithNewState(state);
  return generatePlugin(state.contents.data, state.ppk.data)
    .then(result => {
      state = setPlugin(state, result);
    })
    .catch(error => setError(state, error))
    // delay to indicate to be executed again
    .then(() => delay(300))
    .then(() => {
      state = finishLoading(state);
      return state;
    });
};

const handleClearBtn = (state, render, $$fileUploaders) => new Promise(
  resolve => resolve(createInitialState())
);

module.exports = {
  handleUploadedPPK,
  handleUploadedPluginZip,
  handleCreateBtn,
  handleClearBtn,
};
