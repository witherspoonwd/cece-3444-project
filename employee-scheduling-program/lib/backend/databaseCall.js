import mysql from "mysql2/promise";

export async function callDatabase(query, values) {
  const dbconnection = await mysql.createConnection({
    host: process.env.SQL_HOST,
    database: process.env.SQL_DB,
    user: process.env.SQL_USR,
    password: process.env.SQL_PASS,
    socketPath: process.env.SQL_SOCK
  });

  try {

    let callvalues;

    if (!values){
      callvalues  = [];
    }

    else {
      callvalues = values;
    }

    const data = await dbconnection.execute(query, callvalues);
    dbconnection.end();

    if (data[0].length === 0) {
      return -1; // Return -1 if no entries are returned
    }

    return data[0];
  }

  catch(error){
    console.log("DATABASE CALL ERROR: ", error);
    return -1;
  }
};