/* eslint-disable no-console */ // we want to display useful information to the build pipeline
const { join, resolve } = require('path');
const { existsSync, readFileSync } = require('fs');
const { homedir } = require('os');
var shell = require('shelljs');
var detox = require('./detox');

const android = {
  gradle: '',
  config: () =>
    JSON.parse(readFileSync(join(__dirname, '..', 'config', 'android.json'))),
  debugGradle: () => android.config().debugGradle,
  cmdlineTools: () => {
    const config = android.config();
    return join(
      process.env[config.android.sdkVariableName],
      config.android.cliToolsDirectory
    );
  },
  checkJavaVersion: home => {
    console.log('Java Home Path --> ', home);
    const config = android.config().android;
    const javaVersion = /(java|openjdk) (.*)/gim;
    const majorVersion = /[0-9]{1,}/;

    const javaPath = resolve(home, 'bin', 'java');

    const result = shell.exec(`"${javaPath}" --version`, { silent: true });
    const { stdout } = result;

    console.log('$javahome --version output -->', stdout);
    const version = +majorVersion.exec(javaVersion.exec(stdout).pop());
    console.log(config);
    if (!config.allowedJdkVersions.includes(version)) {
      throw new Error(
        `JDK version ${version} cannot be used. Allowed versions are: ${config.allowedJdkVersions.join(
          ', '
        )}`
      );
    }

    console.log(`JDK version: ${version}`);
  },
  checkSdkSet: () => {
    const config = android.config().android;
    if (!process.env[config.sdkVariableName]) {
      throw new Error(`${config.sdkVariableName} not set!`);
    }

    console.log('Android SDK path set');

    if (!existsSync(android.cmdlineTools())) {
      throw new Error(
        `Cmdline tools not found. Expected dir: ${android.cmdlineTools()}`
      );
    }

    console.log('Cmdline tools found');
  },
  checkSupportLibs: () => {
    const config = android.config().android;

    if (!existsSync(join(__dirname, 'suppLibs', 'test-butler-app.apk'))) {
      console.log('Test Butler apk missing, downloading');
      shell.mkdir('suppLibs');
      shell.exec(
        `curl -f -o ./suppLibs/test-butler-app.apk ${config.testbutlerUrl}`
      );
    }
  },
  avdPath: () => {
    detox.openDetoxRc();

    const config = android.config().android;
    const avdEnvPath = process.env[config.avdHomeVariableName];
    const avdHomePath = [homedir(), '.android', 'avd'];

    const avdName = `${config.avdConfig.name}.avd`;
    return avdEnvPath
      ? resolve(join(avdEnvPath, avdName))
      : resolve(join(...avdHomePath, avdName));
  },
  setGradlePath: () => {
    const config = android.config().android;
    config.appDirectory.forEach(itm => shell.cd(itm));
    android.gradle = resolve('gradlew');
  },
  checkAppApkExists: () => {
    const apkPath = detox.config.apps.android.binaryPath;

    if (!existsSync(resolve(join(__dirname, '..', apkPath)))) {
      throw new Error(
        'The APK file did not exist, check the build log for errors'
      );
    }
  }
};

module.exports = android;
