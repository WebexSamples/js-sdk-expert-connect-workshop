const {createExpertSpace, getUrlParams} = require('./utils');

const {connectToMeeting} = require('./meeting');

function main() {
  const params = getUrlParams(window.location.href);

  if (!params.connect) {
    // Values are incorrect, redirect back to form
    window.location = './index.html';
    return;
  }

  document.getElementById('name').innerHTML = params.name;

  createExpertSpace(params);
}

main();
