// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { oldID } = req.query;
  const newID = req.body.newID;
  
  console.log("New ID: ", newID);
  console.log("Old ID: ", oldID);


  try {

    const preCheck = await callDatabase("SELECT isEmployeeOfTheWeek FROM employees WHERE ID = ?", [oldID]);

    if (preCheck[0].isEmployeeOfTheWeek){
      const query1 = "UPDATE employees SET isEmployeeOfTheWeek = false WHERE ID = ?";
      const values1 = [oldID];
	  const query2 = "UPDATE employees SET isEmployeeOfTheWeek = true WHERE ID = ?";
	  const values2 = [newID];
      console.log("UPDATING");
  
      await callDatabase(query1, values1);
	  await callDatabase(query2, values2);
  
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
