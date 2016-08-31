const ipc = require('electron').ipcRenderer
import fshelper from './../fs'
import $ from 'jquery';

import cleanHtml from './export/cleanHtml'

const pageTemplate = require('./../../htmlTemplates/export/page.html');
const bundleCss = require('./../../htmlTemplates/export/bundle.css.wpexport')

function getPageHtml(page) {
  let data = pageTemplate
    .replace('@title', page.title)
    .replace('@keywords', page.keywords)
    .replace('@description', page.description)
    .replace('@content', cleanHtml(page.getHtmlText()));


  return {
    filename: page.fileName + '.html',
    data: data
  }
}

function getFiles(filePath, sign) {
  // html page
  let project = pageEditor.project;
  let files = project.pages.map(getPageHtml);
  // bundles
  files.push({
    filename: 'bundle.css',
    data: bundleCss
  });
  for (var i = 0; i < files.length; i++) {
    files[i].path = filePath + sign + files[i].filename;
  }
  return files;
}




// call when export project

ipc.on('export-project', function (event, filename) {
  let sign;
  if (filename.indexOf('\\') > -1) {
    // windows
    sign = '\\';
  } else {
    // mac or linux
    sign = '/'
  }
  let folderName = filename.split(/[\/\\]/);
  folderName = folderName[folderName.length - 1];
  // make project folder
  fshelper.mkdirIfNotExist(filename, (err) => {
    if (err) throw err;
    // save file
    let files = getFiles(filename, sign);
    fshelper.writeFiles(files, (index, err, next) => {
      if (err) throw err;
      console.log(`[export project]: save file ${index + 1} of ${files.length}`);
      next();
    })
  });
})