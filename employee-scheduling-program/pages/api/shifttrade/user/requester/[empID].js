import { getRequestsbyUser } from "@/lib/shiftchanges/getRequestsbyUser";

export default async function handler(req, res) {

  const { empID } = req.query;


  try {

    const requests = await getRequestsbyUser(empID);

    res.status(200).json(requests);
  }

  catch(error){
    res.status(500).json(error);
  }
}

