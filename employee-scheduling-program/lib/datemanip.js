export function getNextSunday(inputDate) {

  // returns sunday of next week. if a sunday is passed, will return that day.

  let date = new Date(inputDate);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  console.log("date zeroed: ", date);

  // get current day
  const currentDay = date.getDay();

  // find days until next sunday
  const daysUntilNextSunday = (7 - currentDay) % 7;

  // create date object for next sunday
  const nextSunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysUntilNextSunday);

  return nextSunday;
}

// return mysql date string of last sunday
export function getLastSunday(inputDate) {
  let date = new Date(inputDate);
  // Get the day of the week (0: Sunday, 1: Monday, ..., 6: Saturday)
  const dayOfWeek = date.getDay();

  // Calculate the number of days to subtract to reach the previous Sunday
  const daysToSunday = (dayOfWeek + 7 - 0) % 7;

  // Create a new Date object with the previous Sunday's date
  const previousSunday = new Date(date);
  previousSunday.setDate(date.getDate() - daysToSunday);

  // Format the date as "YYYY-MM-DD"
  const formattedDate = `${previousSunday.getFullYear()}-${String(previousSunday.getMonth() + 1).padStart(2, '0')}-${String(previousSunday.getDate()).padStart(2, '0')}`;

  return formattedDate;
}

export function getLastSundayObject(inputDate) {
  let date = new Date(inputDate);
  // Get the day of the week (0: Sunday, 1: Monday, ..., 6: Saturday)
  const dayOfWeek = date.getDay();

  // Calculate the number of days to subtract to reach the previous Sunday
  const daysToSunday = (dayOfWeek + 7 - 0) % 7;

  // Create a new Date object with the previous Sunday's date
  const previousSunday = new Date(date);
  previousSunday.setDate(date.getDate() - daysToSunday);

  // Format the date as "YYYY-MM-DD"
  const formattedDate = `${previousSunday.getFullYear()}-${String(previousSunday.getMonth() + 1).padStart(2, '0')}-${String(previousSunday.getDate()).padStart(2, '0')}`;

  return previousSunday;
}

export function isTimeInRange(time, startTimeStr, endTimeStr) {


  const startTime = new Date(`1970-01-01T${startTimeStr}`);
  const endTime = new Date(`1970-01-01T${endTimeStr}`);
  const givenTime = new Date(`1970-01-01T${time}`);

/*   console.log("st", startTime, "endTime", endTime, "giv", givenTime); */

  return givenTime >= startTime && givenTime < endTime;
}

export function getDayOfWeek(date){
  const weekdays = [
    'Sun', // Sunday
    'Mon', // Monday
    'Tue', // Tuesday
    'Wed', // Wednesday
    'Thu', // Thursday
    'Fri', // Friday
    'Sat'  // Saturday
  ];
  
  const currentDay = new Date(date).getDay();
  return weekdays[currentDay];
}

export function isRangeAInRangeB(rangeAStart, rangeAEnd, timeStart, timeEnd) {

  let aStart = new Date(rangeAStart);
  let aEnd = new Date(rangeAEnd);

  let aStartGood = isTimeInRange(`${aStart.getHours().toString().padStart(2, "0")}:${aStart.getMinutes().toString().padStart(2, "0")}`, timeStart, timeEnd);
  let aEndGood = isTimeInRange(`${aEnd.getHours().toString().padStart(2, "0")}:${aEnd.getMinutes().toString().padStart(2, "0")}`, timeStart, timeEnd);



  return (aStartGood && aEndGood);
}

export function convertToTimeString(time){
  let editTime = new Date(time);

  return `${editTime.getHours().toString().padStart(2, "0")}:${editTime.getMinutes().toString().padStart(2, "0")}`;
}

export function areDatesOnSameDay(indate1, indate2) {
  let date1 = new Date(indate1);
  let date2 = new Date(indate2);

  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getCurrentMySQLTime(){
  const inputDate = new Date();
  const adjustedDate = new Date(inputDate.getTime() - 5 * 60 * 60 * 1000);
  const mysqlDatetimeString = adjustedDate.toISOString().slice(0, 19).replace('T', ' ');

  return String(mysqlDatetimeString);
}

export function convertToMySQLTime(date){
  const inputDate = new Date(date);
  const adjustedDate = new Date(inputDate.getTime() - 5 * 60 * 60 * 1000);
  const mysqlDatetimeString = adjustedDate.toISOString().slice(0, 19).replace('T', ' ');

  return String(mysqlDatetimeString);
}