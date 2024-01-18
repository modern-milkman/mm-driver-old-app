import { MssqlConnector } from './mssql-connector';
import { Config } from '../config/config';
import { regions } from '../regions';

export class Database {
  static fromRegion(region) {
    const regionName = Object.keys(regions)[region];

    const dbConfig = Config.config.env.db
      .filter(itm => Object.keys(itm).filter(key => key === regionName)[0])
      .pop()[regionName];

    var db = new MssqlConnector({
      user: dbConfig.user,
      password: dbConfig.password,
      server: dbConfig.host,
      database: dbConfig.name,
      connectionTimeout: dbConfig.connectionTimeout,
      requestTimeout: dbConfig.requestTimeout
    });

    return db;
  }
}
