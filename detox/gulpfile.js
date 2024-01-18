/* eslint-disable no-console */ // we want to provide useful info to the pipeline
var android = require('./utilities/android');
var emulator = require('./utilities/emulator');
var build = require('./utilities/build');
var findJava = require('find-java-home');
var gulp = require('gulp');
var shell = require('shelljs');

gulp.task('sanity-check:pre:android', cb => {
  findJava({ allowJre: false }, (err, home) => {
    if (err) {
      throw err;
    }

    if (!home) {
      throw new Error(
        'JRE was potentially found, but a JDK version does not exist.'
      );
    }

    android.checkJavaVersion(home);
    android.checkSupportLibs();
    android.checkSdkSet();
    cb();
  });
});

gulp.task('create-emu:android', cb => {
  emulator.createEmulator();
  cb();
});

gulp.task('path:android', cb => {
  android.setGradlePath();
  cb();
});

gulp.task('clean-build:android', cb => {
  const isDocker = build.isDocker();
  const debug = android.debugGradle();

  console.log('running in docker: ', isDocker);

  shell.exec(`${android.gradle} clean ${debug ? '--debug' : ''}`);

  cb();
});

gulp.task('compile:android', cb => {
  const isDocker = build.isDocker();
  const debug = android.debugGradle();
  const config = android.config();

  console.log('running in docker: ', isDocker);

  var args = require('yargs').argv;

  // determines which .env file is used
  const environment = args.environment
    ? args.environment
    : config.build.environment;

  // if set to false then npx react-native start must be run manually
  // as the application bundle will not be created
  const bundle = args.bundle ? args.bundle : config.build.bundle;

  // assembleAndroidTest MUST be provided to perform UI testing.
  const command = `${
    android.gradle
  } assemble${environment} assembleAndroidTest ${
    !bundle ? '-DtestBuildType=debug' : ''
  } ${debug ? '--debug' : ''}`;

  console.log(`running ${command}`);

  shell.exec(command);
  cb();
});

gulp.task('sanity-check:post:android', cb => {
  const isDocker = build.isDocker();
  if (!isDocker) {
    android.checkAppApkExists();
  }
  cb();
});

gulp.task(
  'build:android',
  gulp.series([
    'sanity-check:pre:android',
    'create-emu:android',
    'path:android',
    'clean-build:android',
    'compile:android',
    'sanity-check:post:android'
  ])
);

gulp.task('build:ios');
