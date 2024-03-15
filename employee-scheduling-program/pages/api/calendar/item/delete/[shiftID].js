// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { shiftID } = req.query;

  try {

    const query = "DELETE FROM schedule_items WHERE ID = ?";
    const values = [shiftID];

    console.log("DELETING", shiftID);

    await callDatabase(query, values);

    res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}

