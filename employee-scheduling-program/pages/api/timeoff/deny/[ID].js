// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { ID } = req.query;
  const empID = req.body.empID;

  //console.log(empID);


  try {

    const preCheck = await callDatabase("SELECT * FROM time_off_requests WHERE ID = ?", [ID]);

    if (preCheck[0].empID === empID){
      const query = "UPDATE time_off_requests SET approvedBySupervisor = false WHERE ID = ?";
      const values = [ID];

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
