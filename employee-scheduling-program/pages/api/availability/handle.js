// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const empID = req.body.empID;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const weekday = req.body.weekday

  console.log("DB: ", empID, startTime, endTime, weekday);

  try {
    let query = "DELETE FROM availability WHERE weekday = ? AND empID = ?";
    let values = [weekday, empID];

    await callDatabase(query, values);

    if (startTime != "none" || endTime != "none"){
      query = "INSERT INTO availability (empID, startTime, endTime, weekday) VALUES (?,?,?,?)";
      values = [empID, startTime, endTime, weekday];

      await callDatabase(query, values);
    }
    res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}

