/* eslint-disable no-console */ // we want to display useful information to the build pipeline
var android = require('./android');
var detox = require('./detox');
var shell = require('shelljs');

const { join } = require('path');
const { existsSync } = require('fs');

const emulator = {
  createEmulator: () => {
    const config = android.config().android;
    const devicePath = android.avdPath();
    const avdConfig = config.avdConfig;

    console.log('device path', devicePath);

    if (!existsSync(devicePath)) {
      const avdPkg = `system-images;android-${avdConfig.sdkVersion};${
        avdConfig ? 'google_apis' : 'default'
      };${avdConfig.arch}`;
      console.log(`creating emulator: ${avdConfig.name} ${avdPkg}`);

      // make sure the package required is installed & accept licenses
      const sdkManagerPath = join(
        android.cmdlineTools(),
        config.toolNames.sdkmanager
      );

      const downloadResult = shell.exec(
        `yes | "${sdkManagerPath}" "${avdPkg}"`
      );

      if (downloadResult.code !== 0) {
        throw new Error(downloadResult.stderr);
      }

      shell.exec(`yes | "${sdkManagerPath}" --licenses`);

      const sdCard = avdConfig.sdcard.use
        ? `--sdcard ${avdConfig.sdcard.size}`
        : '';

      shell.exec(
        `${join(
          android.cmdlineTools(),
          config.toolNames.avdmanager
        )} create avd -n ${avdConfig.name} -d ${
          avdConfig.device
        } --package "${avdPkg}" ${sdCard}`
      );

      // Uncomment to Debug: check emulator runs
      // shell.exec(`${join(process.env[androidSdkVarName], androidToolName.emulator, androidToolName.emulator)} -avd ${androidConfig.name}`);

      // update detoxrc to use the created emulator
      detox.config.devices.emulator.device.avdName = avdConfig.name;
      detox.saveDetoxRc();
      console.log('.detoxrc updated');
    } else {
      console.log(
        `AVD: ${detox.config.devices.emulator.device.avdName} already exists. using`
      );
      avdConfig.name = detox.config.devices.emulator.device.avdName;
    }
  }
};

module.exports = emulator;
