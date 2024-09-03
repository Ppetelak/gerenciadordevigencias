const mysql = require("promise-mysql");
/* Conexão com banco de dados */

const configDev = {
  host: "pablopetelak.com",
  user: "u654656997_dev",
  port: "3306",
  password: "0Uc0d53^w",
  database: "u654656997_mhvendasdev",
  waitForConnections: true,
  connectionLimit: 50, // Ajuste conforme necessário
  queueLimit: 0
}

const configProd = {
  host: 'localhost',
  user: 'midiaIdeal_vigencias2',
  password: 'H^u003zy2',
  database: 'vigencias_db',
  port: '3306',
  waitForConnections: true,
  connectionLimit: 50, // Ajuste conforme necessário
  queueLimit: 0
}

const config = configProd;

module.exports = {
  mysql,
  config
};