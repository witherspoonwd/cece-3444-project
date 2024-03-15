import { getFirstNameFromID } from "@/lib/backend/getEmployeeNameFromID";

export default async function handler(req, res) {

  const { empID } = req.query;


  try {

    const requests = await getFirstNameFromID(empID);

    console.log(requests);

    res.status(200).json(requests);
  }

  catch(error){
    res.status(500).json(error);
  }
}

