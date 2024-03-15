// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { shiftID } = req.query;
  const empID = req.body.empID;

  console.log("Emp ID: ", empID);


  try {

    const preCheck = await callDatabase("SELECT * FROM shift_change_requests WHERE ID = ?", [shiftID]);

    if (preCheck[0].traderEmpID === empID){
      const query = "UPDATE shift_change_requests SET approvedBySupervisor = false WHERE ID = ?";
      const values = [shiftID];

      console.log("UPDATING");
  
      await callDatabase(query, values);
  
      res.status(200).json({success: true});
    }

    else {
      res.status(200).json({success: false});
    }
  }

  catch(error){
    res.status(500).json(error);
  }
}
