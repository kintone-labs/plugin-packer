'use strict';

const assert = require('assert');
const crypto = require('crypto');
const path = require('path');
const AdmZip = require('adm-zip');
const denodeify = require('denodeify');
const rimraf = denodeify(require('rimraf'));
const RSA = require('node-rsa');

const cli = require('../src/cli');
const pluginDir = path.join(__dirname, 'fixtures/sample-plugin/plugin-dir');

describe('cli', () => {
  it('is a function', () => {
    assert(typeof cli === 'function');
  });

  context('generates `plugin.zip` without ppk', () => {
    let zip;
    beforeEach(() =>
      rimraf(`${path.dirname(pluginDir)}/*.*(ppk|zip)`)
      .then(() => cli(pluginDir))
      .then(pluginFile => {
        assert(path.basename(pluginFile) === 'plugin.zip');
        zip = new AdmZip(pluginFile);
      })
    );

    it('the zip contains 3 files', () => {
      const fileNames = zip.getEntries().map(entry => entry.entryName).sort();
      assert.deepEqual(fileNames, [
        'contents.zip',
        'PUBKEY',
        'SIGNATURE',
      ].sort());
    });

    it('the zip passes signature verification', () => {
      const verifier = crypto.createVerify('RSA-SHA1');
      verifier.update(zip.readFile(zip.getEntry('contents.zip')));
      const publicKey = zip.readFile(zip.getEntry('PUBKEY'));
      const signature = zip.readFile(zip.getEntry('SIGNATURE'));
      assert(verifier.verify(derToPem(publicKey), signature));
    });
  });
});

function derToPem(der) {
  const key = new RSA(der, 'pkcs8-public-der');
  return key.exportKey('pkcs1-public-pem');
}
