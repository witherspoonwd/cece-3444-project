// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const traderID = req.body.traderID;
  const tradeeID = req.body.tradeeID;
  const shiftID = req.body.shiftID;

  try {
    const query = "INSERT INTO shift_change_requests (traderEmpID, tradeeEmpID, shiftID) VALUES (?,?,?)";
    const values = [traderID, tradeeID, shiftID]

    await callDatabase(query, values);

    res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}

