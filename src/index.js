import { Shipwreck, _html } from './shipwreck.js';
import {settings} from "./lib/settings/localSettingStorageWrapper";


// notifications
const flash = {
  box: document.getElementById('flash'),
  clear: () => flash.box.innerHTML = '',
  add: (msg, type) => flash.box.appendChild(_html(`<div class="banner ${type}">${msg}</div>`)),
};

// handles to key elements
const shipBase = document.getElementById('ship-base');
const shipPath = document.getElementById('ship-path');
const shipToken = document.getElementById('ship-token');
const shipOutput = document.getElementById('ship-output');
const loadingBar = document.getElementById('loading-bar');

// create shipwreck instance
const ship = new Shipwreck(shipOutput);

shipBase.value = ship.baseUri;

ship.on('fetch', () => {
  loadingBar.style.backgroundColor = 'var(--purple-base)';
  loadingBar.style.width = '10%';
  flash.clear();
});

ship.on('update', (e) => {
  const { entity, href } = e.detail;
  const self = entity && entity.getLink('self');
  let uri = self && self.href || href;
  if (uri) {
    uri = uri.replace(ship.baseUri, '');
    shipPath.value = uri;
    window.location.hash = uri;
  }
  document.body.scrollTop = document.documentElement.scrollTop = 0;
});

ship.on('success', () => {
  loadingBar.style.backgroundColor = 'var(--green-base)';
});

ship.on('error', async (e) => {
  loadingBar.style.backgroundColor = 'var(--red-base)';
  const { message, response } = e.detail;
  flash.add(message, 'critical');
  if (response) {
    const text = await response.clone().text();
    text && flash.add(text, 'critical');
  }
});

ship.on('complete', () => {
  loadingBar.style.width = '100%';
});

shipToken.value = ship.token;
shipToken.addEventListener('change', (e) => ship.token = e.target.value);

// submit API reqest
let active = false;
const _setSail = async function () {
  // one request at a time
  if (active) {
    return;
  }
  active = true;
  try {
    ship.token = shipToken.value;
    ship.baseUri = shipBase.value;
    await ship.fetch(shipPath.value);
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
  active = false; // eslint-disable-line require-atomic-updates
};

// clear auth token and reload
const clearToken = async function () {
  flash.clear();
  shipToken.value = '';
  ship.token = null;
  _setSail();
};
document.getElementById('clear-token-button').addEventListener('click', clearToken);

// pull auth token from current entity properties
const pullToken = async function () {
  const tenantId = prompt("TenantId:");
  const userId = prompt("User Id:");
  const actualUserId = prompt("Actual User Id (impersonation):");
  var scope = prompt("Scope (default will be *:*:*):");
  if(!scope){
    scope = "*:*:*";
  }
  const fsld = prompt("Fsld:");
  var authEndPoint = prompt("Authentication Service Endpoint (Please select a number between 1 and 3) \n1 - https://auth-dev.proddev.d2l/core \n2 - https://dev-auth.brightspace.com/core \n 3 - https://test-auth.brightspace.com/core");
  while(!authEndPoint || isNaN(authEndPoint) || (authEndPoint < 0 || authEndPoint > 3)){
    authEndPoint = prompt("Authentication Service Endpoint (Please select a number between 1 and 3) \n1 - https://auth-dev.proddev.d2l/core \n2 - https://dev-auth.brightspace.com/core \n 3 - https://test-auth.brightspace.com/core");
  }

  var opts = {
    tenant: tenantId,
    remoteIssuer: endpoint,
    scope: scope
  };

  if(userId) {
    opts.user = userId;
  }

  if(actualUserId) {
    opts.impersonator = actualUserId;
  }

  if(fsid) {
    opts.fsid = fsld;
  }

  alert("THIS FUNCTIONALITY IS NOT COMPLETE. NO TOKEN WILL BE RETURNED");
  //TODO - Figure out how to use @d2l/gimmeToken or some other package to make a token using this info
  //another option is how we get oauth tokens in hm-api-test, but it involves the user knowing the username and password of the user they want
};
document.getElementById('pull-token-button').addEventListener('click', pullToken);

// submit form
const submitRequest = function (e) {
  e.preventDefault();
  window.location.hash = shipPath.value;
  _setSail();
};
document.getElementById('main-form').addEventListener('submit', submitRequest);

// sync the location hash with the api href input field
const _checkHash = function () {
  const hash = window.location.hash.slice(1);
  if (shipPath.value === hash) {
    return;
  }
  shipPath.value = hash;
  _setSail();
};

window.onhashchange = _checkHash;
window.onload = _checkHash;

const _openDialog = function () {
  document.getElementById("myModal").style.display = "block";
}

const _closeDialog = function () {
  document.getElementById("myModal").style.display = "none";
}

document.getElementById('settings-button').addEventListener('click', _openDialog);
document.getElementById('settings-close-button').addEventListener('click', _closeDialog);

const _updateSettings = function (e) {

  const form = document.getElementById('settingsEdit');

  settings.setSettings(form.elements);

  _closeDialog();
  return false;
}

document.getElementById('settingsEdit').addEventListener('submit',_updateSettings);
