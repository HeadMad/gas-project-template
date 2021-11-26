const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const claspConfig = require('./.clasp.json');
const { basename } = require('path');

const actions = {};
const action = process.argv[2];


actions.test = () => {
  // prompt('Basename:', 'hi');
  console.log(process.argv)
}

function run(func) {
  let result = execSync(func).toString();
  return result
}


actions.init = async () => {
  let result = await run('clasp create --type webapp --rootDir ./appsscript');
  fs.rename('./appsscript/.clasp.json', './.clasp.json',  err => err ?? console.log);
  let data = fs.readFileSync('./.clasp.json', 'utf8');
  console.log(result)
}

actions.deploy = () => {
  let result = run('clasp deploy');
  let devID = result.match(/-\s([^\s]+)\s/)[1];
  claspConfig.deploymentId = devID; 
  fs.writeFileSync('.clasp.json', JSON.stringify(claspConfig));
  console.log(result);
}



if (action in actions)
  actions[action]();
else
  console.error('Unknown command: ' + action);