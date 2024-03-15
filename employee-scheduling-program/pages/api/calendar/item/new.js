// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";
import { findScheduleHeader } from "@/lib/calendar/backend/findScheduleHeader";

import { convertToMySQLTime } from "@/lib/datemanip";

export default async function handler(req, res) {

  const empID = req.body.empID;
  const startTime = convertToMySQLTime(req.body.startTime);
  const endTime = convertToMySQLTime(req.body.endTime);

  const headerID = await findScheduleHeader(startTime);

  try {
    const query = "INSERT INTO schedule_items (empID, headerID, startTime, endTime) VALUES (?,?,?,?)";
    const values = [empID, headerID, startTime, endTime];

    await callDatabase(query, values);

    res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}

