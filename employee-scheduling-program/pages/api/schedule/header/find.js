// bcrypt import
import { findScheduleHeader } from "@/lib/calendar/backend/findScheduleHeader";
import { getLastSunday } from "@/lib/datemanip";

export default async function handler(req, res) {

  const traderID = req.body.traderID;
  const tradeeID = req.body.tradeeID;
  const shiftID = req.body.shiftID;

  try {
    await findScheduleHeader("2023-07-23T17:14:01.946Z");


    res.status(200).json({success: true});
  }

  catch(error){
    console.log(error);
    res.status(500).json(error);
  }
}

