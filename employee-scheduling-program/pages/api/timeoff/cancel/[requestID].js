// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { requestID } = req.query;
  const empID = req.body.empID;

  console.log("===================DB START======================");
  console.log(empID);
  console.log(requestID);


  try {

    const preCheck = await callDatabase("SELECT * FROM time_off_requests WHERE ID = ?", [requestID]);

    if (preCheck[0].empID === empID){
      const query = "DELETE FROM time_off_requests WHERE ID = ?";
      const values = [requestID];

      console.log("DELETING");
  
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

