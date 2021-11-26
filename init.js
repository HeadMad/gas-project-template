const { execSync } = require('child_process');
const fs = require('fs');
const basename = require('./package.json').name;


(async function () {
  let webapp = false;
  const claspCommand = await createClaspCommand(process.argv[2], (param, value) => {
    const actions = {
      def: () => webapp = true && `clasp create --title "${basename}" --type webapp --rootDir ./appsscript`,
      title: (value) => webapp = true && `clasp create --title "${value}" --type webapp --rootDir ./appsscript`,
      clone: (scriptID) => `clasp clone ${scriptID} --rootDir ./appsscript`
    };

    if (param in actions)
      return actions[param](value);
  });


  const result = await run(claspCommand);
  console.log(result);

  await fs.rename('./appsscript/.clasp.json', './.clasp.json', err => {
    if (err) throw err;
  });

  if (webapp)
    fs.readFile('./appsscript/appsscript.json', (err, data) => {
      if (err) throw err;

      const config = JSON.parse(data);
      Object.assign(config, {
        webapp: {
          access: "MYSELF",
          executeAs: "USER_DEPLOYING"
        }
      });

      fs.writeFile('./appsscript/appsscript.json', JSON.stringify(config, null, '  '), err => {
        if (err) throw err;
      });
    });

})();



function run(func) {
  let result = execSync(func).toString();
  return result
}



function createClaspCommand(arg, handler) {
  let param = 'def';
  let value;
  if (arg && arg.includes(':')) {
    let ind = arg.indexOf(':');
    param = arg.substr(0, ind);
    value = arg.substr(ind + 1);
  }
  return handler(param, value);
}