export default function convertToBigCalendar(origObj, week){
  let convertObj;

  let firstDate = getFirstDay(new Date());

  // in a loop for each member of the origObj:

  // find each hour int, convert to date
  // in "week" param passed to function

  // generate title based on empID and name

  // that's it?

  console.log(firstDate);

}

function getFirstDay(week){
  var curr = new Date(week); // get current date
  var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
  var last = first + 6; // last day is the first day + 6

  first = new Date(curr.setDate(first)).setHours(0,0,0,0);
  first = new Date(first).toLocaleString();

  var firstday = new Date(curr.setDate(first));
  /*   var lastday = new Date(curr.setDate(last)).toUTCString(); */

  return first;
}