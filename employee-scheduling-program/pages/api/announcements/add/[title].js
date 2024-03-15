// bcrypt import
import { callDatabase } from "@/lib/backend/databaseCall";

export default async function handler(req, res) {

  const { title } = req.query;
  const date = req.body.date;
  const content = req.body.content;


  try {
      const query = "INSERT INTO Announcements (title, time_date, content) VALUES (?, ?, ?)";
	  const values = [title, date, content];
      console.log("UPDATING");
  
      await callDatabase(query, values);
  
      res.status(200).json({success: true});
  }

  catch(error){
    res.status(500).json(error);
  }
}
