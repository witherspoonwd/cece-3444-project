import { findScheduleHeaderObj } from "@/lib/calendar/backend/findScheduleHeader";

export default async function handler(req, res) {

  const headerDate = req.body.headerDate;

  try {
    const header = await findScheduleHeaderObj(headerDate);
    console.log("HEADER: ", header);
    const headerID = header.ID;
    const isPublished = (header.isPublished == null || header.isPublished == 0) ? false : true;

    res.status(200).json({headerID: headerID, isPublished: isPublished});
  }

  catch(error){
    console.log(error);
    res.status(500).json(error);
  }
}

