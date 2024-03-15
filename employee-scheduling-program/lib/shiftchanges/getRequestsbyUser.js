import { callDatabase } from "../backend/databaseCall";
import { getEmployeeNameFromID, getFirstNameFromID } from "../backend/getEmployeeNameFromID";
import { dispLocalDate, dispLocalTime  } from '@/lib/dispLocalDate';

//BACKEND ONLY FUNCTION
export async function getRequestsbyUser(empID){

  /* 
  SELECT scr.ID, scr.shiftID, scr.approvedBySupervisor, scr.acceptedByTradee, s.startTime, s.endTime
  FROM shift_change_requests AS scr
  RIGHT JOIN schedule_items AS s
  ON scr.shiftID = s.ID
  WHERE traderEmpID = 10002
  AND scr.approvedBySupervisor IS NULL 
  */

  const query = "SELECT scr.ID, scr.shiftID, scr.tradeeEmpID, scr.approvedBySupervisor, scr.acceptedByTradee, s.startTime, s.endTime FROM shift_change_requests AS scr RIGHT JOIN schedule_items AS s ON scr.shiftID = s.ID WHERE traderEmpID = ? AND scr.approvedBySupervisor IS NULL";
  const values = [empID];

  const data = await callDatabase(query, values);



/*   console.log(data); */

  if (data == -1){
    return {}
  }

  const formattedRequest = await Promise.all(data.map(async (item) => {

    const shiftTitle = `${dispLocalDate(item.startTime)} ${dispLocalTime(item.startTime)} - ${dispLocalTime(item.endTime)}`;
    let status;

    let emp = await getEmployeeNameFromID(item.tradeeEmpID);

    if (!item.approvedBySupervisor && item.acceptedByTradee){
      status = "Waiting for supervisor approval";
    }

    else {
      status = "Waiting for coworker approval";
    }
    

    return {
      ID: item.ID,
      status: status,
      title: shiftTitle,
      emp: emp
    }
  }));

  return formattedRequest;
}