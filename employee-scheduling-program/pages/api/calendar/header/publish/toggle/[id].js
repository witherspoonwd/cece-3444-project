// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { id } = req.query;

  try {

    let query = "SELECT isPublished FROM schedule_headers WHERE ID = ?";
    let values = [id];

    let data = await callDatabase(query, values);

    let isPublished = data[0].isPublished;
    let newPub;

    if (isPublished == null || isPublished == 0){
      newPub = true;
    }

    else {
      newPub = false;
    }

    query = "UPDATE schedule_headers SET isPublished = ? WHERE ID = ?";
    values = [newPub, id];

    await callDatabase(query, values);


    res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}

