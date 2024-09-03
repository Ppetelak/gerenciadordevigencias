const mysql = require("promise-mysql");
/* Conexão com banco de dados */

const configDev = {
  host: "pablopetelak.com",
  user: "u654656997_vigencias_user",
  port: "3306",
  password: "pmpDevPablo@078917",
  database: "u654656997_vigencias",
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

const config = configDev;

module.exports = {
  mysql,
  config
};