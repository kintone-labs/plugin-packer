'use strict';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const UPLOAD_PPK = 'UPLOAD_PPK';
const UPLOAD_PLUGIN_START = 'UPLOADING_PLUGIN_START';
const UPLOAD_PLUGIN = 'UPLOAD_PLUGIN';
const UPLOAD_PLUGIN_FAILURE = 'UPLOAD_PLUGIN_FAILURE';
const CREATE_PLUGIN_ZIP = 'CREATE_PLUGIN_ZIP';
const CREATE_PLUGIN_ZIP_START = 'CREATE_PLUGIN_ZIP_START';
const CREATE_PLUGIN_ZIP_FAILURE = 'CREATE_PLUGIN_ZIP_FAILURE';
const RESET = 'RESET';

const uploadPPK = (fileName, fileReader) => dispatch => {
  fileReader().then(text => dispatch({
    type: UPLOAD_PPK,
    payload: {
      data: text,
      name: fileName,
    },
  }));
};

const uploadPlugin = (fileName, fileReader, validateManifest) => dispatch => {
  dispatch({type: UPLOAD_PLUGIN_START});
  fileReader()
    .then(buffer => validateManifest(buffer).then(() => buffer))
    .then(
      buffer => {
        dispatch({
          type: UPLOAD_PLUGIN,
          payload: {
            data: buffer,
            name: fileName,
          },
        });
      },
      error => {
        dispatch({
          type: UPLOAD_PLUGIN_FAILURE,
          payload: error,
        });
      }
    );
};

const createPluginZip = generatePluginZip => (dispatch, getState) => {
  dispatch({
    type: CREATE_PLUGIN_ZIP_START,
  });
  const state = getState();
  Promise.all([
    generatePluginZip(state.contents.data, state.ppk.data),
    delay(300),
  ]).then(
    ([result]) => {
      dispatch({
        type: CREATE_PLUGIN_ZIP,
        payload: result,
      });
    },
    error => {
      dispatch({
        type: CREATE_PLUGIN_ZIP_FAILURE,
        payload: error,
      });
    });
};

const reset = () => ({
  type: RESET,
});

module.exports = {
  UPLOAD_PPK,
  UPLOAD_PLUGIN,
  UPLOAD_PLUGIN_START,
  UPLOAD_PLUGIN_FAILURE,
  CREATE_PLUGIN_ZIP,
  CREATE_PLUGIN_ZIP_START,
  CREATE_PLUGIN_ZIP_FAILURE,
  RESET,
  uploadPPK,
  uploadPlugin,
  reset,
  createPluginZip,
};
