import { readFileSync } from 'fs';
import { join } from 'path';

export class Config {
  static config;

  static openConfig(configName = 'test') {
    if (Config.config) {
      return;
    }

    const configFile = JSON.parse(
      readFileSync(join(process.cwd(), 'config', `${configName}.json`))
    );

    if (configFile.env) {
      const variables = Object.keys(configFile.env);
      const path = configFile.env;

      Config.recurseConfig(configName, path, variables);
    }

    Config.config = configFile;
  }

  static recurseConfig(configName, path, variables, pathString = '') {
    for (let variable of variables) {
      if (Array.isArray(path[variable]) || typeof path[variable] === 'object') {
        const newPathString = Number.isNaN(+variable)
          ? `${pathString}${variable}_`
          : pathString;

        this.recurseConfig(
          configName,
          path[variable],
          Object.keys(path[variable]),
          newPathString
        );
      } else {
        const name = `${configName}_${pathString}${variable}`.toUpperCase();
        const value = process.env[name];

        if (value) {
          path[variable] = value;
        } else {
          // eslint-disable-next-line no-console
          console.warn(`WARN: Environment variable wasn't set: ${name}`);
        }
      }
    }
  }
}
