import * as mysql from "mysql2/promise";

export class Database {
  private static instance: mysql.Pool;

  private constructor() {}

  public static getInstance(): mysql.Pool {
    if (!Database.instance) {
      Database.instance = mysql.createPool({
        host: "localhost",
        user: "root",
        password: "root",
        database: "tickets",
        port: 33060,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
    }
    return Database.instance;
  }
}

// export function createConnection() {
//   return mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'root',
//     database: 'tickets',
//     port: 33060
//   });
// };
