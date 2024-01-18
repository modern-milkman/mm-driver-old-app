import * as sql from 'mssql/msnodesqlv8';

export class Parameter {
  name = '';
  type = sql.VarChar;
  value = '';

  constructor(name, value, type = 'VarChar') {
    this.name = name;
    this.type = sql[type];
    this.value = value;
  }
}
