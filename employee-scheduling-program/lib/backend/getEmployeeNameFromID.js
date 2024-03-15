import { callDatabase } from "./databaseCall";

export async function getEmployeeNameFromID(empID){
  const query = "SELECT firstName, lastName FROM employees WHERE ID = ?";
  const values = [empID];

  let rawData = await callDatabase(query, values);

  return `${rawData[0].firstName} ${rawData[0].lastName}`
}

export async function getFirstNameFromID(empID){
  const query = "SELECT firstName FROM employees WHERE ID = ?";
  const values = [empID];

  let rawData = await callDatabase(query, values);

  return `${rawData[0].firstName}`
}

export async function getLastNameFromID(empID){
  const query = "SELECT lastName FROM employees WHERE ID = ?";
  const values = [empID];

  let rawData = await callDatabase(query, values);

  return `${rawData[0].lastName}`
}