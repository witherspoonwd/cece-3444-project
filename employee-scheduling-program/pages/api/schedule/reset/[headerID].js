// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { headerID } = req.query;

  try {

    let query = "DELETE FROM schedule_items WHERE headerID = ?";
    let values = [headerID];

    await callDatabase(query, values);

    res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}

