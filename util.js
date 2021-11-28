const fs = require('fs');
const { execSync } = require('child_process');
const packageConfig = require('./package.json');

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

actions.deploy = () => {
  let result = run('clasp push -f && clasp deploy');
  let deploymentId = result.match(/-\s([^\s]+)\s/)[1];
  // "deploy": "node util.js deploy"
  packageConfig.scripts.deploy = 'clasp push && clasp deploy --deploymentId ' + deploymentId;
  fs.writeFileSync('package.json', JSON.stringify(packageConfig, null, '  '));
  console.log(result);
}



if (action in actions)
  actions[action]();
else
  console.error('Unknown command: ' + action);