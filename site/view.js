'use strict';

class View {
  constructor(elements) {
    this.$ = elements;
  }
  show(el) {
    el.classList.remove('hide');
  }
  hide(el) {
    el.classList.add('hide');
  }
  render(state) {
    this.renderResult(state);
    this.renderUploadPPKArea(state);
    this.renderUploadZipArea(state);
    this.renderBtn(state);
  }
  decorateDragOver(el) {
    el.style.backgroundColor = '#EEE';
  }
  decorateDragLeave(el) {
    el.style.backgroundColor = '#FFF';
  }
  renderBtn(state) {
    if (state.loading) {
      this.show(this.$.createLoadingBtn);
      this.hide(this.$.createBtn);
    } else {
      this.show(this.$.createBtn);
      this.hide(this.$.createLoadingBtn);
    }
    if (state.contents.data) {
      this.$.createBtn.classList.remove('disabled');
    } else if (!state.loading) {
      this.$.createBtn.classList.add('disabled');
    }
  }
  renderUploadZipArea(state) {
    this.decorateDragLeave(this.$.zipDropArea);
    if (state.contents.data) {
      this.show(this.$.zipOkIcon);
    } else {
      this.hide(this.$.zipOkIcon);
    }
    if (state.contents.name) {
      this.$.zipFileName.textContent = state.contents.name;
    } else {
      this.$.zipFileName.textContent = '...';
    }
  }
  renderUploadPPKArea(state) {
    this.decorateDragLeave(this.$.ppkDropArea);
    if (state.ppk.data) {
      this.show(this.$.ppkOkIcon);
    } else {
      this.hide(this.$.ppkOkIcon);
    }
    if (state.ppk.name) {
      this.$.ppkFileName.textContent = state.ppk.name;
    } else {
      this.$.ppkFileName.textContent = '...';
    }
  }
  renderResult(state) {
    if (state.error) {
      this.renderErrorMessages(state);
    } else if (state.plugin.url.contents) {
      this.renderDownloadLinks(state);
    } else {
      this.hide(this.$.error);
      this.hide(this.$.download);
    }
  }
  renderDownloadLinks(state) {
    this.hide(this.$.error);
    this.show(this.$.download);
    this.$.downloadPluginId.textContent = state.plugin.id;
    this.$.downloadPlugin.href = state.plugin.url.contents;
    this.$.downloadPPK.href = state.plugin.url.ppk;
  }
  renderErrorMessages(state) {
    this.hide(this.$.download);
    this.show(this.$.error);
    const e = state.error;
    let errors = e.validationErrors;
    if (!e.validationErrors) {
      errors = [e.message];
    }
    const ul = this.$.errorMessages;
    ul.innerHTML = '';
    errors.forEach(error => {
      const li = document.createElement('li');
      li.textContent = error;
      ul.appendChild(li);
    });
  }
}
module.exports = View;
