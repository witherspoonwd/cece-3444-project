import { callDatabase } from "@/lib/backend/databaseCall";

export async function getEmployeeNameById(empID) {
	const query = "SELECT firstName, lastName FROM employees WHERE ID = ?";
	const values = [empID];
	
	const result = await callDatabase(query, values);
	
	const name = `${result[0].firstName} ${result[0].lastName}`;
	
	return name;
}
