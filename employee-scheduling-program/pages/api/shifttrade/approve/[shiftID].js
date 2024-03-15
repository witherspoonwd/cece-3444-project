// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { shiftID } = req.query;
  const traderEmpID = req.body.traderEmpID;
  const tradeeEmpID = req.body.tradeeEmpID;
  console.log("Trader ID: ", traderEmpID);
  console.log("Tradee ID: ", tradeeEmpID);
  console.log("Shift ID here: ", shiftID);


  try {

    const preCheck = await callDatabase("SELECT * FROM shift_change_requests WHERE shiftID = ?", [shiftID]);
    console.log("made it here", preCheck);
    if (preCheck[0].traderEmpID === traderEmpID){
      const query1 = "UPDATE shift_change_requests SET approvedBySupervisor = true WHERE shiftID = ?";
      const values1 = [shiftID];
      console.log("SHIFT ID BEING UPDATED: ", shiftID)
	  const query2 = "UPDATE schedule_items SET empID = ? WHERE ID = ?";
	  const values2 = [tradeeEmpID, shiftID];
      console.log("UPDATING");
  
      await callDatabase(query1, values1);
	  await callDatabase(query2, values2);
  
      res.status(200).json({success: true});
    }

    else {
      console.log("Else statement");
      res.status(200).json({success: false});
    }
  }

  catch(error){
    console.log("error statement");
    res.status(500).json(error);
  }
}
