const { execSync } = require('child_process');
const fs = require('fs');
const basename = require('./package.json').name;
const folder = './appsscript';

(async function () {
  if (!fs.existsSync(folder))
    fs.mkdirSync(folder, { recursive: true });

  let webapp = false;
  const claspCommand = await createClaspCommand(process.argv[2], (param, value) => {
    const actions = {
      def: () => webapp = true && `clasp create --title "${basename}" --type webapp --rootDir ${folder}`,
      title: (value) => webapp = true && `clasp create --title "${value}" --type webapp --rootDir ${folder}`,
      clone: (scriptID) => `clasp clone ${scriptID} --rootDir ${folder}`
    };

    if (param in actions)
      return actions[param](value);
  });


  const result = await run(claspCommand);
  console.log(result);

  await fs.rename(folder + '/.clasp.json', './.clasp.json', err => {
    if (err) throw err;
  });

  if (webapp)
    fs.readFile(folder + '/appsscript.json', (err, data) => {
      if (err) throw err;

      const config = JSON.parse(data);
      Object.assign(config, {
        webapp: {
          access: "MYSELF",
          executeAs: "USER_DEPLOYING"
        }
      });

      fs.writeFile(folder + '/appsscript.json', JSON.stringify(config, null, '  '), err => {
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