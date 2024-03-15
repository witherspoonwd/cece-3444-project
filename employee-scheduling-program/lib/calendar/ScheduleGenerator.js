import { dispLocalTime } from "../dispLocalDate";

const { getNextSunday, getDayOfWeek, isTimeInRange } = require("../datemanip");

export class ScheduleGenerator {
  // times for dates
  openTime;
  closeTime;
  nextSunday;

  // main object for generation
  thirtyGrid = [];

  // availability and employees ledger
  availability;
  employees;

  // option vars
  maxShiftLength = 17;

  constructor(calObj){
    this.openTime = new Date();
    this.openTime.setHours(8);
    this.openTime.setMinutes(0);
  
    this.closeTime = new Date();
    this.closeTime.setHours(22);
    this.closeTime.setMinutes(0);

    this.availability = calObj.availability;
    this.generateEmployeeLedger(calObj.employees);

    console.log("EMPLOYEES: ", this.employees);
    console.log("AVAILABILITY: ", this.availability);
 
    this.nextSunday = getNextSunday(new Date());

    console.log("NEXT SUNDAY: ", this.nextSunday);
  }

  // SET WEEK TO GENERATE (optional)
  setWeek(date){
    this.nextSunday = getNextSunday(new Date(date));
  }

  // SET MAX SHIFT LENGTH (in hours) ((optional))
  setMaxShiftLength(hours){
    this.maxShiftLength = (hours * 2) + 1;
  }

  // MAIN GENERATOR
  generate(){
    this.genThirtyGrid();
    this.assignNonOpenEmployees();
    this.optimizeShiftLengthsForNonOpenEmployees();
    this.fillGapsWithFullShifters();
    return this.convertToItems();
  }

  // MAKE EMPLOYEE LEDGER
  generateEmployeeLedger(employees){

    let newEmployeeArray = employees;
  
    for (let i = 0; i < newEmployeeArray.length; i++){
      let oldObj = newEmployeeArray[i];
      oldObj = {
        ...oldObj,
        fullShifts: []
      }
      newEmployeeArray[i] = oldObj;
    }
  
    for (let i = 0; i < this.availability.length; i++){
      if (this.availability[i].startTime == "00:00:00" && this.availability[i].endTime == "23:59:00"){
        let empID = this.availability[i].empID;
        let index = newEmployeeArray.findIndex((obj) => obj["ID"] == empID);
  
        newEmployeeArray[index].fullShifts.push(this.availability[i].weekday);
      }
    }
  
    this.employees = newEmployeeArray;
  }

  // GENERATE INITIAL THIRTY GRID
  genThirtyGrid(){
    for (let i = 0; i < 7; i++){

      // get time stretch for this day based on increment
      const currentTime = new Date(this.nextSunday); // Start with the next Sunday
      currentTime.setDate(currentTime.getDate() + i)
      currentTime.setHours(this.openTime.getHours());
      currentTime.setMinutes(this.openTime.getMinutes());
    
      const endTime = new Date(this.nextSunday);
      endTime.setDate(endTime.getDate() + i)
      endTime.setHours(this.closeTime.getHours());
      endTime.setMinutes(this.closeTime.getMinutes());

      // get day of week
      const dayOfWeek = getDayOfWeek(currentTime);
  
      while (currentTime <= endTime) {
  
        let eligibleEmployeeIds = [];
  
        // check who can work here
        this.availability.forEach((element) => {
          if (element.weekday == dayOfWeek && isTimeInRange(`${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`, element.startTime, element.endTime)){
            eligibleEmployeeIds.push(element.empID);
          }
        });
        
  
        // create thirtyGrid with this information
        this.thirtyGrid.push({
          time: new Date(currentTime),
          eligibleEmployeeIds: eligibleEmployeeIds, // Placeholder for employees scheduled at this time
          assignedEmployees: [],
          day: dayOfWeek
        });
  
        // Increment time by 30 minutes
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
  
/*       // get last object for day in thirty grid and mark it as last slot 
      // of the day
  
      const oldObj = this.thirtyGrid[this.thirtyGrid.length - 1];
  
      const markedObj = {...oldObj, lastInDay: true};
      this.thirtyGrid[this.thirtyGrid.length - 1] = markedObj; */
    }
  }

  // ASSIGN NON-OPEN AVAILABILITY EMPLOYEES
  assignNonOpenEmployees(){
    for (let i = 0; i < this.thirtyGrid.length; i++){
      this.thirtyGrid[i].eligibleEmployeeIds.forEach((empID) => {
        if (this.isEmployeeFullShifted(empID, this.thirtyGrid[i].day) == false){
          this.thirtyGrid[i].assignedEmployees.push(empID);
        }
      });
    }
  }

  // limit shift lengths to 8 hours
  optimizeShiftLengthsForNonOpenEmployees(){
    let counters = [];
    let lastDaySeen = 'Sun';

    for (let i = 0; i < this.thirtyGrid.length; i++){
      // if day changed, reset counters.
      if (this.thirtyGrid[i].day != lastDaySeen){
        counters = [];
        lastDaySeen = this.thirtyGrid[i].day;
      }

      // begin loop through assigned employees
      this.thirtyGrid[i].assignedEmployees.forEach((employee, index) => {
        const counterIndex = counters.findIndex((obj) => obj["empID"] == employee);

        // check to see if employee is listed in counters, if not, add them and increment
        if (counterIndex === -1){
          counters.push({
            empID: employee,
            count: 1
          })
        } else if (counters[counterIndex].count < this.maxShiftLength){
          counters[counterIndex].count++; // increment if present
        } else { // unassign if shift goes over max shift length.
          this.thirtyGrid[i].assignedEmployees.splice(index, 1);
        }
      })
    }
  }

  // find gaps and use full shifters to cover them (as much as possible);
  fillGapsWithFullShifters(){

    let lastDaySeen; // day track for shift assign loops
    let dayInQuestion = "init"; //day track for main thirty grid loop

    let fullShifters, fullShiftersIDs

    let fullShiftersUsed;

    console.log(this.thirtyGrid);

    for(let i = 0; i < this.thirtyGrid.length; i++){
      // keep track of day for main loop
      lastDaySeen = this.thirtyGrid[i].day;

      if (dayInQuestion != lastDaySeen){
        // reset full shifters
        fullShifters = this.employees.filter(obj => obj.fullShifts.includes(lastDaySeen));
        fullShiftersIDs = fullShifters.map(obj => obj.ID);
        dayInQuestion = lastDaySeen;
      }

      // if find gap
      if (this.thirtyGrid[i].assignedEmployees.length === 0){
        console.log("GAP FOUND AT: ", i);

        let upperBoundGapIndex = -1, lowerBoundGapIndex = -1;

        // find upper bound of gap
        for (let j = i; j < Math.min(i + 16, this.thirtyGrid.length); j++){
          if (this.thirtyGrid[j].assignedEmployees.length !== 0 || this.thirtyGrid[j].day != lastDaySeen){
            upperBoundGapIndex = j;
            break;
          }
          upperBoundGapIndex = j;
        }

        // find lower bound of gap
        for (let j = i; j >= Math.max(i - 17, 0); j--){
          if (this.thirtyGrid[j].assignedEmployees.length !== 0 || this.thirtyGrid[j].day != lastDaySeen){
            lowerBoundGapIndex = j;
            break;
          }

          lowerBoundGapIndex = j;
        }

        // find gaplength
        const gapLength = upperBoundGapIndex - lowerBoundGapIndex;

        // choose an employee from full shifters at random (if theres any left):
        if (fullShiftersIDs.length > 0){
          let lotteryWinnerIndex = Math.floor(Math.random() * fullShiftersIDs.length);
          const empToAssign = fullShiftersIDs[lotteryWinnerIndex];
          console.log("winner winner: ", empToAssign, " on ", lastDaySeen);
          fullShiftersIDs.splice(lotteryWinnerIndex, 1); // delete them from array

          let chunksAssigned = 0;

          console.log(lowerBoundGapIndex, upperBoundGapIndex);

          if (gapLength <= 16){
            for (let j = lowerBoundGapIndex; j < Math.min(i + 16, this.thirtyGrid.length); j++){
              if (this.thirtyGrid[j].day == lastDaySeen){
                this.thirtyGrid[j].assignedEmployees.push(empToAssign);
                chunksAssigned++;
              }
            }

            // if a short shift has been created, go ahead and extend it from the back as much as possible
            if (chunksAssigned < this.maxShiftLength){
              let chunksToAssign = this.maxShiftLength - chunksAssigned;
              for (let j = lowerBoundGapIndex; j > Math.max(i - chunksToAssign, 0); j--){
                if (!this.thirtyGrid[j].assignedEmployees.includes(empToAssign) && this.thirtyGrid[j].day == lastDaySeen){
                  this.thirtyGrid[j].assignedEmployees.push(empToAssign);
                }
              }
            }

          }
        }
      }
    }
  }

  // convert to "itemy array" for react-big-calendar
  convertToItems(){
    let lookingFor = [];
    let builts = [];

    let toSplice = [];

    for (let i = 0; i < this.thirtyGrid.length; i++){
      // check for any new lookingFors
      for (let j = 0; j < this.thirtyGrid[i].assignedEmployees.length; j++){
        // if so, build an object and add it to lookingFor
        if (!lookingFor.find(obj => obj.ID === this.thirtyGrid[i].assignedEmployees[j])){
          lookingFor.push({
            ID: this.thirtyGrid[i].assignedEmployees[j],
            startTime: this.thirtyGrid[i].time,
            endTime: null,
            title: null,
            day: this.thirtyGrid[i].day
          });

          //console.log("HIT: ", this.thirtyGrid[i].assignedEmployees[j]);
        }
      }

      console.log("LOOKING FOR #", i, lookingFor);

      for (let j = 0; j < lookingFor.length; j++){
        // if someone dropped off
        if (!this.thirtyGrid[i].assignedEmployees.includes(lookingFor[j].ID) || lookingFor[j].day !== this.thirtyGrid[i].day){
          console.log("dropoff of ", lookingFor[j].ID);
          lookingFor[j].endTime = this.thirtyGrid[i - 1].time;

          const employeeInQuestion = this.employees.find(obj => obj.ID === lookingFor[j].ID);
          const titleString = `${employeeInQuestion.firstName} ${employeeInQuestion.lastName.at(0)}.`;
          lookingFor[j].title = titleString;

          builts.push(lookingFor[j]);

          toSplice.push(lookingFor[j].ID);
        }
      }

      // if were at the end of the grid, build all lookingFors
      if (i == (this.thirtyGrid.length - 1)){
        for (let j = 0; j < lookingFor.length; j++){
          lookingFor[j].endTime = this.thirtyGrid[i].time;

          const employeeInQuestion = this.employees.find(obj => obj.ID === lookingFor[j].ID);
          const titleString = `${employeeInQuestion.firstName} ${employeeInQuestion.lastName.at(0)}.`;
          lookingFor[j].title = titleString;

          builts.push(lookingFor[j]);

          toSplice.push(j);
        }
      }

      // Case for where there is a drop off but a user is assigned.
      for (let j = 0; j < this.thirtyGrid[i].assignedEmployees.length; j++){
        // if so, build an object and add it to lookingFor
        if (toSplice.indexOf(this.thirtyGrid[i].assignedEmployees[j]) !== -1) {
          console.log("HIT!!!!! HIT HIT HIT!!!!");
          lookingFor.push({
            ID: this.thirtyGrid[i].assignedEmployees[j],
            startTime: this.thirtyGrid[i].time,
            endTime: null,
            title: null,
            day: this.thirtyGrid[i].day
          });

          //console.log("HIT: ", this.thirtyGrid[i].assignedEmployees[j]);
        }
      }

      // Clean lookingFor
      for (let j = 0; j < toSplice.length; j++) {
        const idToRemove = toSplice[j];
        const indexToRemove = lookingFor.findIndex((obj) => obj.ID === idToRemove);

        if (indexToRemove !== -1) {
          lookingFor.splice(indexToRemove, 1);
        }
      }

      toSplice = []; // clean toSplice
    }
    console.log(builts);
    return builts;
  }

  // check if employee is fullshifted that day:
  isEmployeeFullShifted(empID, dayOfWeek){
    let empIndex = this.employees.findIndex((obj) => obj["ID"] == empID);

    if (empIndex !== -1){
      const indexOfFullshift = this.employees[empIndex].fullShifts.indexOf(dayOfWeek);

      if (indexOfFullshift !== -1){
        return true;
      }

      else {
        return false;
      }
    }
    else {
      return false;
    }
  }

}