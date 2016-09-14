const electron = require('electron')
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var windowsList = {}

var Globals = {
  getBrowserWindow: function (name) {
    if (windowsList[name]) return windowsList[name];
    let window = new BrowserWindow({
      width: 800,
      height: 600,
      // Enables Chromium's experimental features
      webPreferences: {
        experimentalFeatures: true
      }
    });
    windowsList[name] = window;
    return window;
  },
  hasWindow: function (name) {
    return !!windowsList[name];
  },
  destroyWindow: function (name) {
    if (windowsList[name]) {
      delete windowsList[name]
    }
  }
}


module.exports = Globals;