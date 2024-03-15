// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";
import { convertToMySQLTime } from "@/lib/datemanip";

export default async function handler(req, res) {

  const empID = req.body.empID;
  const startTime = convertToMySQLTime(req.body.startTime);
  const endTime = convertToMySQLTime(req.body.endTime);

  console.log("DB: ", empID, startTime, endTime);

  try {
    let query = "INSERT INTO time_off_requests (startTime, endTime, empID) VALUES (?,?,?)";
    let values = [startTime, endTime, empID];

    await callDatabase(query, values);
    res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}

