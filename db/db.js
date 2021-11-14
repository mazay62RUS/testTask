const Pool = require('pg').Pool

const AuthDbData = require('./db_connect.json')
//const conString = `postgres://${AuthDbData.user}:${AuthDbData.password}@${AuthDbData.host}:${AuthDbData.port}/${AuthDbData.database}`

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "DB",
  password: "root",
  port: 5432
})

module.exports = pool