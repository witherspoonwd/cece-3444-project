import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { empID } = req.query;


  try {

    const items = await callDatabase("SELECT * FROM schedule_items");

    res.status(200).json(items);
  }

  catch(error){
    res.status(500).json(error);
  }
}

