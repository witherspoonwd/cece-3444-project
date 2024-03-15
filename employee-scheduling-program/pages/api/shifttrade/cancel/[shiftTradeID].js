// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { shiftTradeID } = req.query;
  const empID = req.body.empID;

  console.log(empID);


  try {

    const preCheck = await callDatabase("SELECT * FROM shift_change_requests WHERE ID = ?", [shiftTradeID]);

    if (preCheck[0].traderEmpID === empID){
      const query = "DELETE FROM shift_change_requests WHERE ID = ?";
      const values = [shiftTradeID];

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

