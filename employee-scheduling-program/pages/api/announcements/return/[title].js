import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { title } = req.query;


  try {
	const query = "SELECT * FROM Announcements";
    const items = await callDatabase(query);
	
	console.log("Items: ", items);

    res.status(200).json(items);
  }

  catch(error){
    res.status(500).json(error);
  }
}
