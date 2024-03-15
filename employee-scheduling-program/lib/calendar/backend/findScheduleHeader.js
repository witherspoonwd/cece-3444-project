import { callDatabase } from "@/lib/backend/databaseCall";
import { convertToMySQLTime } from "@/lib/datemanip";
import { getLastSunday } from "@/lib/datemanip";

export async function findScheduleHeader(date){

  console.log("looking for: ", date);

  let sunday = getLastSunday(date);

  console.log("detected sunday", sunday);

  let data = await callDatabase("SELECT * FROM schedule_headers WHERE startDay = ?", [sunday]);

  if (data == -1){
    let query = "INSERT INTO schedule_headers (startDay) VALUES (?)";
    let values = [sunday];
    let data = await callDatabase(query, values);

    return data.insertId;
  }

  console.log("data: ", data);
  return data[0].ID;
}

export async function findScheduleHeaderObj(date){

  console.log("looking for: ", date);

  let sunday = getLastSunday(date);

  console.log("detected sunday", sunday);

  let data = await callDatabase("SELECT * FROM schedule_headers WHERE startDay = ?", [sunday]);

  if (data == -1){
    let query = "INSERT INTO schedule_headers (startDay) VALUES (?)";
    let values = [sunday];
    let data = await callDatabase(query, values);

    let ID = data.insertId;

    query = "SELECT * FROM schedule_headers WHERE ID = ?";
    values = [ID];

    data = await callDatabase(query, values);
    console.log(data);
    return data[0];
  }

  console.log("data: ", data);
  return data[0];
}