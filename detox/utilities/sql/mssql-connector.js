import { readFileSync } from 'fs';

export class MssqlConnector {
  pool = {};
  client = require('mssql/msnodesqlv8');

  constructor(connectionString) {
    this.initialize(connectionString);
  }

  initialize(connectionString) {
    this.pool = new this.client.ConnectionPool(connectionString);
  }

  async runFromFile(sqlFile, parameters = null) {
    var sql = readFileSync(sqlFile, { encoding: 'utf8' }).toString();
    return await this.runCommand(sql, parameters);
  }

  async runCommand(sql, parameters = null) {
    return new Promise(async (resolve, reject) => {
      if (!this.pool) {
        return reject('Pool was not set up');
      }

      await this.pool.connect().then(
        async _ => {
          const request = new this.client.Request(this.pool);

          if (parameters) {
            parameters.forEach(itm => {
              request.input(itm.name, itm.type, itm.value);
            });
          }

          await request.query(sql).then(
            async result => {
              await this.pool.close();
              return resolve(result);
            },
            async reason => {
              await this.pool.close();
              return reject(reason);
            }
          );
        },
        reason => {
          return reject(reason);
        }
      );

      return resolve();
    });
  }
}
