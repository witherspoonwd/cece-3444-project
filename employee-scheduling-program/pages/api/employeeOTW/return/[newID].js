import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { newID } = req.query;


  try {
	const query = "SELECT ID, firstName, lastName, profilePic FROM employees WHERE ID = ?";
	const values = [newID];
    const items = await callDatabase(query, values);
	
	console.log("Items: ", items);

    res.status(200).json(items);
  }

  catch(error){
    res.status(500).json(error);
  }
}
