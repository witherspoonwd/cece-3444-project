// main imports
import Image from 'next/image'
import Link from 'next/link';

// react imports
import { Fragment, useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import { useRouter } from 'next/router';
import { withSessionSsr } from '@/lib/config/withSession';
// stylesheet imports
import styles from '@/styles/calendar.module.css';
/* import 'react-big-calendar/lib/css/react-big-calendar.css'; */

// component import
import NavBar from "@/components/navbar.js";
import { Panel } from "@/components/general_components/panel";
import { Modal } from "@/components/general_components/modal";
import { ButtonBox } from "@/components/general_components/buttonsBox";

// function import
import convertToBigCalendar from '@/lib/calendar/convertToBigCalendar';
import { callDatabase } from "@/lib/backend/databaseCall"; // BACKEND ONLY
import { getRequestsbyUser } from '@/lib/shiftchanges/getRequestsbyUser'; // BACKEND ONLY
import { dispLocalDate, dispLocalTime, dispLocalDateWithDay  } from '@/lib/dispLocalDate';
import { getNextSunday, isTimeInRange, getDayOfWeek, isRangeAInRangeB, convertToMySQLTime, convertToTimeString, areDatesOnSameDay, getLastSunday, getLastSundayObject } from '@/lib/datemanip';
import { 
  CalContextProvider,
  getObjContext,
  getModalContext,
  getUpdateInfoContext,
  getAddScheduleItemContext,
  getEmpNameFunction,
  getDeleteScheduleItemContext,
  getResetScheduleContext
 } from '@/components/calendar/CalContextProvider';
import { ScheduleGenerator } from '@/lib/calendar/ScheduleGenerator';
import Availability from './availability';


 const IronSessionCheck = withSessionSsr(({ req }) => {
  const user = req.session.user;
  if (!user) {
    //console.log("Not user");
    return {
      redirect: {
        destination: '/login', // Redirect to the login page if user is not logged in
        permanent: false,
      },
    };
  }
  //else{
    //console.log("User");
    //console.log(user);
    //console.log(user.role);
    //console.log(user.empName);
  //}
  //console.log("User: ", user);
  return {
    props: { 
		user, 
	},
  };
});

// localizer for big-calendar
const localizer = momentLocalizer(moment);

export default function CalendarPage({calendarObj, employeeLoggedIn}){
  const isSupervisor = JSON.parse(calendarObj).isSupervisor;

  const { query: { role, empName, id } } = useRouter();


  return(
    <Fragment>
      <NavBar role={role}  empName={empName} id={id}/>
      <CalContextProvider obj={JSON.parse(calendarObj)}>
        {isSupervisor && <SupervisorDashboard />}
        {!isSupervisor && <EmployeeDashboard />}
      </CalContextProvider>
    </Fragment>
  )
}

// =============== MANAGER COMPONENTS ================

function SupervisorDashboard() {
  const [currentView, setCurrentView] = useState("week");
  const [currentRange, setCurrentRange] = useState(null);

  return (
    <div className={styles.dashboardContainer}>
      <CalendarEditor currentView={currentView} setCurrentView={setCurrentView} setCurrentRange={setCurrentRange}/>
      <ManagerPanelsContainer currentRange={currentRange}/>
    </div>
  )
}

function CalendarEditor(props) {
  let calObj = getObjContext();
  let getEmpName = getEmpNameFunction();

  const [schedule, setSchedule] = useState(CalConversion(calObj.items, getEmpName));
  const [editItems, setEditItems] = useState([]);
  const [fusedItems, setFusedItems] = useState(CalConversion(calObj.items, getEmpName));
  const [modalState, setModalState] = useState(null);

  useEffect(() => {
    if (editItems.length !== 0) {
      // Convert calObj.items and editItems to arrays if they are objects
      const calObjArray = Array.isArray(calObj.items) ? calObj.items : [calObj.items];
      const editItemsArray = Array.isArray(editItems) ? editItems : [editItems];
  
      // Merge the arrays and then pass it to CalConversion
      const fusedArray = [...calObjArray, ...editItemsArray];
      setFusedItems(CalConversion(fusedArray, getEmpName));
    } else {
      setFusedItems(CalConversion(calObj.items, getEmpName));
    }
  }, [calObj, editItems]);

  const disableModal = () => {
    setModalState(null);
  };


  console.log("NEW RENDER: ", calObj);
  const handleEventCreate = useCallback(
    ({ start, end }) => {

      // no shifts longer than 8 hours
      if ((new Date(end).getTime() -  new Date(start).getTime()) > (1000*60*60*8)){
        return;
      }

      // no shifts outside of operating hours
      if (!(isTimeInRange(convertToTimeString(start), "08:00", "22:01") && isTimeInRange(convertToTimeString(end), "08:00", "22:01"))){
        return;
      }

      setModalState(
        <ShiftCreateModal 
          startTime={start} 
          endTime={end}
          toggleFunction={disableModal}
        />
      )
    },
    [setSchedule]
  );

  const handleSelectEvent = useCallback(
    (event) => {
      setModalState(
        <ShiftInfoModal
          startTime={event.startTime}
          endTime={event.endTime}
          title={event.title}
          itemID={event.ID}
          toggleFunction={disableModal}
        />
      )
    },
    []
  )

  const handleViewChange = (view) => {
    // Extracting the start and end dates of the new range from the view object
    props.setCurrentView(view);
  };

  const handleRangeChange = (range) => {
    // Extracting the start and end dates of the new range from the view object
    if (props.currentView == "week" && !range.start){
      console.log("RANGE[0]: ", range[0]);
      let setDate = new Date(new Date(range[0]).getTime() + 2000*20000);
      props.setCurrentRange(setDate);
    }
  };

  return (
    <Fragment>
      <div className={styles.calendarPanelContainer}>
        <Panel replaceBodyClass={styles.calendarPanelBody}>
          <Calendar
            events={fusedItems}
            defaultView={Views.WEEK}
            startAccessor="startTime"
            endAccessor="endTime"
            defaultDate={moment().toDate()}
            onSelectSlot={handleEventCreate}
            onSelectEvent={handleSelectEvent}
            localizer={localizer}
            onView={handleViewChange}
            onRangeChange={handleRangeChange}
            selectable
          />
        </Panel>
      </div>

      {modalState}
    </Fragment>
  );
}

function ManagerPanelsContainer(props) {
  return (
    <div className={styles.panelsContainer}>
      <ShiftHeaderPanel currentRange={props.currentRange}/>
{/*       <ManagerActionsPanel /> */}
      {/* <DebugPanel /> */}
    </div>
  )
}

function ManagerActionsPanel(){
  let calObj = getObjContext();

  const addScheduleItem = getAddScheduleItemContext();

  const [modalState, setModalState] = useState(null);
  const [modalToggle, setModalToggle] = useState("init");

  useEffect(() => {
    if (modalToggle == "init"){
      setModalToggle(false);
    }

    if (modalToggle == true){
      if (!modalState){
        setModalState(<ShiftTradeModal toggleFunction={toggleShiftTradeModal} />);
      }
  
      else {
        setModalState(false);
      }
    }

    setModalToggle(false);
  }, [modalToggle]);

  // note post routine
  const toggleShiftTradeModal = () => {
    setModalToggle(true);
  }

  const generateSchedule = () => {
    let generator = new ScheduleGenerator(calObj);
    generator.generate();
  }

  return (
    <Panel header="Actions">
      <ul className={styles.panelList}>
        <li>
          <Link href="#">Print Schedule</Link>
        </li>
      </ul>
      {modalState}
    </Panel>
  )
}

function ShiftHeaderPanel(props) {

  let calObj = getObjContext();
  let apiAddItem = getAddScheduleItemContext();
  let apiResetSchedule = getResetScheduleContext();

  const [selectedDay, setSelectedDay] = useState(getLastSundayObject(new Date()));
  const [headerObj, setHeaderObj] = useState(null);
  const [togglePublishStatusBool, setTogglePublishStatusBool] = useState("init");
  const [publishStatusString, setPublishStatusString] = useState("Not Published");
  const [publishButtonString, setPublishButtonString] = useState("Publish Schedule");
  const [toggleUpdateHeader, setToggleUpdateHeader] = useState(null);

  // if range changes, update it here
  useEffect(() => {
    if (props.currentRange == null){
      return;
    }

    setSelectedDay(getLastSundayObject(new Date(props.currentRange)));
  }, [props.currentRange])

  // useEffect for getting new header information
  useEffect(() => {
    let isMounted = true;
  
    async function fetchData() {
      try {
        // Call the API and store the result in a variable
        const headerData = await getHeaderID(selectedDay);
  
        console.log(headerData);
  
        // Update the state with the fetched data
        if (isMounted) {
          setHeaderObj(headerData);
        }
      } catch (error) {
        // Handle any errors that might occur during the API call
        console.error('Error fetching data:', error);
      }
    }
  
    fetchData();
  
    return () => {
      // Cleanup function to run when the component unmounts
      isMounted = false;
    };
  }, [selectedDay, toggleUpdateHeader]);

  // use effect that sets the "isPublished" string
  useEffect(() => {

    if (headerObj == null){
      return;
    }

    let pubString = (headerObj.isPublished == null || headerObj.isPublished == 0) ? "Not Published" : "Published";
    let pubStringButton = (headerObj.isPublished == null || headerObj.isPublished == 0) ? "Publish Schedule" : "Unpublish Schedule";

    setPublishStatusString(pubString);
    setPublishButtonString(pubStringButton);

  }, [headerObj]);

  const togglePublishStatus = async () => {
    await toggleHeaderPublishStatus(headerObj.headerID);
    setToggleUpdateHeader((prev) => !prev);
  }

  // fucntions to navigatie
  const prevWeek = () => {
    setSelectedDay(new Date(selectedDay.getTime() - 7*24*60*60*1000));
  }

  const nextWeek = () => {
    setSelectedDay(new Date(selectedDay.getTime() + 7*24*60*60*1000));
  }

  const generateSchedule = async () => {
    let autoGenerator = new ScheduleGenerator(calObj);
    autoGenerator.setWeek(selectedDay.getTime() - 24*60*60*1000);
    let schedule = autoGenerator.generate();

    schedule.forEach((item) => {
      apiAddItem(item.ID, item.startTime, item.endTime);
    });
  };

  const resetSchedule = async () => {
    console.log(headerObj.headerID);
    apiResetSchedule(headerObj.headerID);
  }

  return (
    <Panel header="Schedule Editor">
      <div className={styles.shiftHeaderSelectorBox}>
        <Link href="#" onClick={prevWeek}>&#60;</Link> &nbsp;&nbsp;&nbsp;
        {dispLocalDate(selectedDay)} - {dispLocalDate(new Date(getNextSunday(new Date(selectedDay.getTime() + 24 * 60 * 60 * 1000)).getTime() - 24*60*60*1000))} &nbsp;&nbsp;&nbsp;
        <Link href="#" onClick={nextWeek}>&#62;</Link>
      </div>
      <div className={styles.shiftHeaderStatusDisplay}>
        <b>Status:</b> {publishStatusString}
      </div>
      <div className={styles.shiftHeaderActionBox}>
        <Link onClick={generateSchedule} href="#">Generate Schedule</Link><br />
        <Link onClick={togglePublishStatus} href="#">{publishButtonString}</Link><br />
        <Link onClick={resetSchedule} href="#">Reset Schedule</Link>
      </div>
    </Panel>
  );
}

async function getHeaderID(date){
  const payload = {
    headerDate: date
  };

/*   console.log("PAYLOAD: ", payload); */

  try {
    const response = await fetch('/api/calendar/header/id', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: "same-origin"
    });

    const get = await response.json();

    console.log(get);

    return get;

  }

  catch (error) {
    return false;
  }
}

async function toggleHeaderPublishStatus(id){
  try {
    const response = await fetch('/api/calendar/header/publish/toggle/' + id, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "same-origin"
    });

    const get = await response.json();

    if (get.success === true){
      return true;
    }

    else {
      return false;
    }
  }

  catch (error) {
    return false;
  }
}

function ShiftCreateModal(props){
  let calObj = getObjContext();
  const addScheduleItem = getAddScheduleItemContext();

  const employeeSelectors = findEligibleEmployeesToAssign(calObj.employees, calObj.availability, calObj.timeOffRequests, props.startTime, props.endTime);
  const [selectedEmployee, setSelectedEmployee] = useState(employeeSelectors[0].ID);
  const [submitToggle, setSubmitToggle] = useState("init");

  const handleSelectedEmployeeChange = (event) => {
    setSelectedEmployee(event.target.value);
  };

  const toggleSubmit = () => {
    setSubmitToggle(true);
  };

  useEffect(() => {
    if (submitToggle === "init" || submitToggle === false){
      return;
    }

    async function callapi() {
      addScheduleItem(selectedEmployee, props.startTime, props.endTime);
    };

    callapi();

    props.toggleFunction();
  }, [submitToggle]);

  let buttons = {
    0: {
      func: props.toggleFunction,
      text: "Cancel"
    },
    1: {
      func: toggleSubmit,
      text: "Assign Shift"
    }
  };

  return(
    <Modal toggleFunction={props.toggleFunction}>
      <Panel header="New Shift" addClass={styles.extendModalPanel}>
        <div className={styles.shiftCreatorBody}>

          <div className={styles.shiftCreatorHeader}>
            Assigning on: {dispLocalDateWithDay(props.startTime)}, {dispLocalTime(props.startTime)} - {dispLocalTime(props.endTime)}
          </div>

          <div className={`${styles.shiftCreatorHeader} ${styles.shiftCreatorSelectHeader}`}>
            Select employee:
          </div>

          <select value={selectedEmployee} onChange={handleSelectedEmployeeChange}>
            {
              employeeSelectors.map((prop) => {
                return (
                  <option key={`${prop.text} ${prop.ID}`} value={prop.ID}>{`${prop.firstName} ${prop.lastName}`}</option>
                )
              })
            }
          </select>
          
          <ButtonBox buttons={buttons}/>
        </div>
      </Panel>
    </Modal>
  );
}

function ShiftInfoModal(props){
  let calObj = getObjContext();

  let deleteItem = getDeleteScheduleItemContext();

  console.log(props.itemID);

  const [submitToggle, setSubmitToggle] = useState("init");

  const toggleSubmit = () => {
    setSubmitToggle(true);
  };

  useEffect(() => {
    if (submitToggle === "init" || submitToggle === false){
      return;
    }

    async function callapi() {
      deleteItem(props.itemID);
    };

    callapi();

    props.toggleFunction();
  }, [submitToggle]);

  let buttons = {
    0: {
      func: toggleSubmit,
      text: "Delete Shift"
    },
    1: {
      func: props.toggleFunction,
      text: "Close"
    }
  };

  return(
    <Modal toggleFunction={props.toggleFunction}>
      <Panel header="Shift Information" addClass={styles.extendModalPanel}>
        <div className={styles.shiftCreatorBody}>

          <div className={styles.shiftCreatorHeader}>
            Date: {dispLocalDateWithDay(props.startTime)}, {dispLocalTime(props.startTime)} - {dispLocalTime(props.endTime)}
          </div>
          <div className={styles.shiftCreatorHeader}>
            Assigned Employee: {props.title}
          </div>

          
          <ButtonBox buttons={buttons}/>
        </div>
      </Panel>
    </Modal>
  );
}

function findEligibleEmployeesToAssign(employees, availability, timeOffRequests, startTime, endTime){

  let eligibleEmployeeIds = [];

  let dayOfWeek = getDayOfWeek(startTime);

  // check if it is in availability.
  availability.forEach((element) => {
    if (element.weekday == dayOfWeek && isRangeAInRangeB(startTime, endTime, element.startTime, element.endTime)){
      eligibleEmployeeIds.push(element.empID);
    }
  });

  // check if anybody in eligibleEmployeeIDs has timeoff
  eligibleEmployeeIds = eligibleEmployeeIds.filter((ID) => {
    let willNotRemove = true;
    if (timeOffRequests.some(request => request.empID === ID)){
      timeOffRequests.forEach((request) => {
        if (areDatesOnSameDay(request.startTime, startTime) && request.approvedBySupervisor == true && isRangeAInRangeB(startTime, endTime, convertToTimeString(request.startTime), convertToTimeString(request.endTime))){
          willNotRemove = false;
        }
      });
    }

    return willNotRemove;
  });

  let employeeArray = employees.filter((element) => {
    if (eligibleEmployeeIds.includes(element.ID)){
      return true;
    }

    else {
      return false;
    }
  });

  return employeeArray;

}


// =============== EMPLOYEE COMPONENTS ===============

function EmployeeDashboard() {

  let modal = getModalContext();

  return (
    <div className={styles.dashboardContainer}>
      <CalendarDisp />
      <PanelsContainer />
      {modal}
    </div>
  )
}

function PanelsContainer() {
  return (
    <div className={styles.panelsContainer}>
      <OptionsPanel />
      <ShiftTradeDispPanel />
      {/* <DebugPanel /> */}
    </div>
  )
}

function CalendarDisp(){

  let calObj = getObjContext();
  let getEmpName = getEmpNameFunction();

  const [schedule, setSchedule] = useState(CalConversion(calObj.items, getEmpName));


  //<div className={styles.calendarContainer} style={{ height: '500pt'}}>

  return (
    <Fragment>
      <div className={styles.calendarPanelContainer}>
        <Panel replaceBodyClass={styles.calendarPanelBody}>
          <Calendar
            defaultView={Views.MONTH}
            events={schedule}
            startAccessor="startTime"
            endAccessor="endTime"
            defaultDate={moment().toDate()}
            localizer={localizer}
          />
        </Panel>
      </div>
    </Fragment>
  );
}

function CalConversion(schedule, getEmpName){
  if (schedule == -1){return []}
  schedule.forEach((obj) => {
    obj.startTime = new Date(obj.startTime);
    obj.endTime = new Date(obj.endTime);
    obj.title = getEmpName(obj.empID);
  });

  return schedule;
}

function OptionsPanel(){

  const [modalState, setModalState] = useState(null);
  const [modalToggle, setModalToggle] = useState("init");

  useEffect(() => {
    if (modalToggle == "init"){
      setModalToggle(false);
    }

    if (modalToggle == true){
      if (!modalState){
        setModalState(<ShiftTradeModal toggleFunction={toggleShiftTradeModal} />);
      }
  
      else {
        setModalState(false);
      }
    }

    setModalToggle(false);
  }, [modalToggle]);

  // note post routine
  const toggleShiftTradeModal = () => {
    setModalToggle(true);
  }

  return (
    <Panel header="Actions">
      <ul className={styles.panelList}>
        <li>
          <Link href="#" onClick={toggleShiftTradeModal}>Request shift trade</Link>
        </li>
{/*         <li>
          <Link href="#">Print Schedule</Link>
        </li> */}
      </ul>
      {modalState}
    </Panel>
  )
}

function ShiftTradeModal(props){

  // get cal context
  let calObj = getObjContext();
  const callLocalUpdate = getUpdateInfoContext();

  // find tradable shifts and employees
  const tradableShifts = findEligibleScheduleTrades(calObj.items , calObj.userID);
  const employeeSelectors = findEmployeesScheduleTrades(calObj.employees, calObj.userID);
/*   console.log("MANIP DATA: ", employeeSelectors, tradableShifts); // debug */

  console.log(tradableShifts);

  if (tradableShifts.length == 0){
    return (
      <Modal toggleFunction={props.toggleFunction}>
      <Panel header="Request a shift trade" addClass={styles.extendModalPanel}>
        <div className={styles.shiftTradeRequestBody}>
          <div className={styles.shiftTradeRequestHeader}>
            No tradable shifts!
          </div>


          
          <ButtonBox buttons={{0: {func: props.toggleFunction, text: "Close"}}}/>
        </div>
      </Panel>
    </Modal>
    );
  }

  // define states for storing selections
  const [tradedShift, setTradedShift] = useState(tradableShifts[0].ID);
  const [employeeTradee, setEmployeeTradee] = useState(employeeSelectors[0].ID);

  // states for submitting
  const [submitToggle, setSubmitToggle] = useState("init");

  const handleTradedShiftChange = (event) => {
    setTradedShift(event.target.value);
  };

  const handleEmployeeTradeeChange = (event) => {
    setEmployeeTradee(event.target.value);
  };

  const toggleSubmit = () => {
    setSubmitToggle(true);
  };

  useEffect(() => {


    if (submitToggle === "init" || submitToggle === false){
      return;
    }

    async function callapi() {
/*       console.log("calling with: ", employeeTradee, tradedShift); */
      await submitShiftChangeAPI(calObj.userID, employeeTradee, tradedShift);
      await callLocalUpdate("pendingShiftChangeRequests");
    };

    callapi();

    props.toggleFunction();
  }, [submitToggle]);

  let buttons = {
    0: {
      func: props.toggleFunction,
      text: "Cancel"
    },
    1: {
      func: toggleSubmit,
      text: "Submit request"
    }
  };

  return (
    <Modal toggleFunction={props.toggleFunction}>
      <Panel header="Request a shift trade" addClass={styles.extendModalPanel}>
        <div className={styles.shiftTradeRequestBody}>
          <div className={styles.shiftTradeRequestHeader}>
            Select shift to trade:
          </div>

          <select value={tradedShift} onChange={handleTradedShiftChange}>
            {
              tradableShifts.map((prop) => {
                return (
                  <option key={`${prop.text} ${prop.ID}`} value={prop.ID}>{prop.text}</option>
                )
              })
            }
          </select>

          <div className={styles.shiftTradeRequestHeader}>
            Select who to trade with:
          </div>

          <select value={employeeTradee} onChange={handleEmployeeTradeeChange}>
            {
              employeeSelectors.map((prop) => {
                return (
                  <option key={`${prop.text} ${prop.ID}`} value={prop.ID}>{prop.text}</option>
                )
              })
            }
          </select>
          
          <ButtonBox buttons={buttons}/>
        </div>
      </Panel>
    </Modal>
  )
}

function findEligibleScheduleTrades(items, inputEmpID){

  console.log(items);
  if (items == -1) {return []};

  let now = new Date();
  let selections = items.filter(item => (item.empID == inputEmpID) && (new Date(item.startTime) > now) && (new Date(item.endTime) > now));

  selections = selections.map(item => {
    let date = dispLocalDate(item.startTime);
    let start = dispLocalTime(item.startTime);
    let end = dispLocalTime(item.endTime);

    return {
      ID: item.ID,
      text: `${date} ${start} - ${end}`
    }

  });

  return selections;
}

function findEmployeesScheduleTrades(employees, inputEmpID){
  let employeeStrings = employees.filter(item => (item.ID !== inputEmpID));

  employeeStrings = employeeStrings.map(employee => {
    return {
      ID: employee.ID,
      text: `${employee.firstName} ${employee.lastName}`
    }
  });


  return employeeStrings;
}

async function submitShiftChangeAPI(traderID, tradeeID, shiftID) {
  event.preventDefault(); // don't want the default redirects

  const payload = {
    traderID: traderID,
    tradeeID: tradeeID,
    shiftID: shiftID,
  };

/*   console.log("PAYLOAD: ", payload); */

  try {
    const response = await fetch('/api/shifttrade/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: "same-origin"
    });

    const get = await response.json();

    if (get.success === true){
      return true;
    }

    else {
      return false;
    }
  }

  catch (error) {
    return false;
  }
}

function ShiftTradeDispPanel(props){
  const calObj = getObjContext();
  const shouldDisp = calObj.pendingShiftChangeRequests && Object.keys(calObj.pendingShiftChangeRequests).length > 0;

  if (!shouldDisp){
    return null;
  }

  return(
    <Panel header="Pending Shift Changes">
      <div className={styles.shiftTradeDispBody}>
        {shouldDisp ? (
          Object.keys(calObj.pendingShiftChangeRequests).map((prop) => (
            <PendingShiftChange 
              key={calObj.pendingShiftChangeRequests[prop].ID}
              title={calObj.pendingShiftChangeRequests[prop].title}
              status={calObj.pendingShiftChangeRequests[prop].status}
              emp={calObj.pendingShiftChangeRequests[prop].emp}
              ID={calObj.pendingShiftChangeRequests[prop].ID}
              empID={calObj.userID}
            />
          ))
        ) : (
          "hi"
        )}
      </div>
    </Panel>
  )
}

function PendingShiftChange(props){
  // states for cancel and confirmation
  const [toggleCancel, setToggleCancel] = useState("init");
  const [fakeoutToggleCancel, setFakeoutToggleCancel] = useState("bhopping");

  // functions to trigger useEffect routines
  const startCancelProcess = async () => {
    setToggleCancel('start!');
  }

  const startFakeoutToggleCancel = async () => {
    setFakeoutToggleCancel('start!');
  }


  // cancel element, and update info context
  const [cancelButton, setCancelButton] = useState(<Link href="#" onClick={startFakeoutToggleCancel}>Cancel</Link>)
  const callLocalUpdate = getUpdateInfoContext();


  useEffect(() => {
    if (toggleCancel === "init"){
      return;
    }

    const callapi = async (shiftID, empID) => {
      await cancelShiftChangeAPI(shiftID, empID);
      await callLocalUpdate("pendingShiftChangeRequests");
    }

    callapi(props.ID, props.empID);

  }, [toggleCancel]);

  useEffect(() => {
    if (fakeoutToggleCancel == "bhopping"){
      return;
    }

    setCancelButton(<Link href="#" className={styles.confirmButton} onClick={startCancelProcess}>Confirm.</Link>);


  },[fakeoutToggleCancel]);



  return(
    <div className={styles.pendingShiftChangeContainer}>
      <div className={styles.pendingShiftChange}>
        <b>Shift</b>: {props.title}
      </div>

      <div className={styles.pendingShiftChange}>
        <b>Trading with</b>: {props.emp}
      </div>

      <div className={styles.pendingShiftChangeStatus}>
        <b>Status</b>: {props.status}
      </div>

      <div className={styles.pendingShiftChangeActions}>
        {cancelButton}
      </div>
    </div>
  )
}

async function cancelShiftChangeAPI(shiftChangeID, empID){
  const payload = {
    empID: empID
  }

  console.log("inAPICALL shiftchange:", shiftChangeID);

  try {
    const response = await fetch('/api/shifttrade/cancel/' + shiftChangeID, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: "same-origin"
    });

    const get = await response.json();

    if (get.success === true){
      return true;
    }

    else {
      return false;
    }
  }

  catch (error) {
    return false;
  }
}

function DebugPanel(){

  let obj = getObjContext();

  return(
    <Panel header="Debug Panel">
      <div>
        employees:
      </div>

      <div>
        {JSON.stringify(obj.employees)}
      </div>

      <div>
        headers:
      </div>

      <div>
        {JSON.stringify(obj.headers)}
      </div>

      <div>
        items:
      </div>

      <div>
        {JSON.stringify(obj.items)}
      </div>
    </Panel>
  )
}

export async function getServerSideProps(context) {
  const user = await IronSessionCheck(context);

  if (user && user.redirect) {
    // Handle the redirection
    return {
      redirect: user.redirect,
    };
  }

  let userData = {};

  if (user && user.props && user.props.user) {
    userData = {
      username: user.props.user.username,
      role: user.props.user.role,
      empName: user.props.user.empName,
    };
  }

  let employeeLoggedIn = {
    id: userData.username,
    isSupervisor: (userData.role == "Manager") ? true : false
  };

  let employees = await callDatabase("SELECT ID, firstName, lastName FROM employees");
  let availability = await callDatabase("SELECT * FROM availability");
  let scheduleHeaders = await callDatabase("SELECT * FROM schedule_headers");

  let itemsQuery = (employeeLoggedIn.isSupervisor == true) ? "SELECT * FROM schedule_items" : 
  `
    SELECT items.ID, items.empID, items.headerID, items.startTime, items.endTime
    FROM schedule_items AS items
    INNER JOIN schedule_headers AS headers
    ON headers.ID = items.headerID
    WHERE headers.isPublished = TRUE
  `;

  let scheduleItems = await callDatabase(itemsQuery);



  let pendingRequests = await getRequestsbyUser(employeeLoggedIn.id);
  let timeOffRequests = await callDatabase("SELECT * FROM time_off_requests");

  let calendarObj = {
    employees: employees,
    headers: scheduleHeaders,
    items: scheduleItems,
    availability: availability,
    pendingShiftChangeRequests: pendingRequests,
    userID: employeeLoggedIn.id,
    isSupervisor: employeeLoggedIn.isSupervisor,
    timeOffRequests: timeOffRequests,
  };

  calendarObj = JSON.stringify(calendarObj);
  
  return {
    props: {
      employeeLoggedIn,
      calendarObj
    }
  }
}