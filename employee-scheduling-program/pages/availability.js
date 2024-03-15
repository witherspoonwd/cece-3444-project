import React, { useState, Fragment, useEffect } from 'react';
import styles from '@/styles/availability.module.css';
import {Panel} from "@/components/general_components/panel"

import Link from 'next/link';

import NavBar from '@/components/navbar.js';
import { useRouter } from 'next/router';
import { withSessionSsr } from '@/lib/config/withSession';


import { callDatabase } from "@/lib/backend/databaseCall"; // BACKEND ONLY
import { AvaContextProvider, getAvailabilityCall, getObjContext, getTimeOffRequestCall, getUpdateInfoContext } from '@/components/availability/AvaContextProvider';
import { convertTimeString } from '@/lib/availability/convertTimeString';
import { ButtonBox } from '@/components/general_components/buttonsBox';
import { dispLocalDate } from '@/lib/dispLocalDate';

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


export default function AvailabilityPage({avaObj}) {
  console.log("INIT RENDER: ", JSON.parse(avaObj));
  const { query: { role, empName, id } } = useRouter();


  return (
    <Fragment>
      <NavBar role={role}  empName={empName} id={id}/>
      <AvaContextProvider obj={JSON.parse(avaObj)}>
        <AvailabilityDashboard />
      </AvaContextProvider>
    </Fragment>
  )
}

function AvailabilityDashboard(props){
  return (
    <div className={styles.availabilityDashboardContainer}>
      <AvailabilitySetterHolder />
      <TimeOffRequestPanelContainer />
    </div>
  )
}

function AvailabilitySetterHolder(props){

  let avaObj = getObjContext();

  const weekdays = [
    {long: 'Sunday', short: 'Sun' },
    {long: 'Monday', short: 'Mon' },
    {long: 'Tuesday', short: 'Tue' },
    {long: 'Wednesday', short: 'Wed' },
    {long: 'Thursday', short: 'Thu' },
    {long: 'Friday', short: 'Fri' },
    {long: 'Saturday', short: 'Sat' },
  ];

  const handleChangeOfObject = (shortDay, startTime, endTime, notAvailable, fullShifted) => {

  }


  return (
    <div className={styles.availabilityBody}>

      <div className={styles.availabilityPanelHolder}>
      {weekdays.map((day) => {
        let start, end, notAvailable, fullShifted, dbID = null;

        start = false;
        end = false;
        notAvailable = false;
        fullShifted = false;

        avaObj.availability.map((obj) => {
          if (obj.weekday == day.short){
            start = convertTimeString(obj.startTime, "select");
            end = convertTimeString(obj.endTime, "select");
            dbID = obj.ID;

            if (obj.startTime == "00:00:00" && obj.endTime == "23:59:00"){
              fullShifted = true;
            }
          }
        });

        if (start == false){
          notAvailable = true;
        }

        return(
          <AvailabilitySetterPanel 
            dbStart={start}
            dbEnd={end}
            dbID={dbID}
            notAvailable={notAvailable}
            fullShifted={fullShifted}
            day={day.long}
            selector={day.short}
            key={`${day.long}-${day.short}`}
          />
        )
      })}
      </div>
    </div>
  )
}

function AvailabilitySetterPanel(props){

  const availabilityCaller = getAvailabilityCall();
  const avaObj = getObjContext();

  let initFrom = "08:00 AM", initTo = "04:00 PM";

  if (props.dbStart && !(props.notAvailable || props.fullShifted)){
    initFrom = props.dbStart;
  }

  if (props.dbEnd && !(props.notAvailable || props.fullShifted)){
    initTo = props.dbEnd
  }

  const [fromValue, setFromValue] = useState(initFrom);
  const [toValue, setToValue] = useState(initTo);
  const [isNotAvailable, setIsNotAvailable] = useState(props.notAvailable);
  const [isFullShifted, setIsFullShifted] = useState(props.fullShifted);
  const [toggleApiCall, setToggleApiCall] = useState("init");

  useEffect(() => {
    if (toggleApiCall == "init" || toggleApiCall == false){
      return;
    }

    const obj = {
      empID: avaObj.empID,
      startTime: fromValue,
      endTime: toValue,
      isFullShifted: isFullShifted,
      isNotAvailable: isNotAvailable,
      ID: props.dbID,
      day: props.selector
    }

    async function callApi(obj) {
      await availabilityCaller(obj);
    }

    callApi(obj);
    setToggleApiCall(false);
  }, [toggleApiCall]);

  const handleFromChange = (event) => {
    console.log("from value", event);
    setFromValue(event.target.value);
    setToggleApiCall(true);
  }

  const handleToChange = (event) => {
    setToValue(event.target.value);
    setToggleApiCall(true);
  }

  const handleNotAvailableChange = (event) => {
    if (event.target.checked == true){
      setFromValue(initFrom);
      setToValue(initTo);
      setIsFullShifted(false);
    }

    setIsNotAvailable(event.target.checked); 
    setToggleApiCall(true);
  }

  const handleAllDayChange = (event) => {
    console.log(event.target.checked);

    if (event.target.checked == true){
      setFromValue(initFrom);
      setToValue(initTo);
      setIsNotAvailable(false);
    }

    setIsFullShifted(event.target.checked); 
    setToggleApiCall(true);
  }

  /*   const timeRange */
  let timeOptions = generateTimeOptions();

  console.log(props.dbStart, props.dbEnd, props.dbID, props.notAvailable, props.fullShifted);

/*   const [start, setStart] = useState(props.dbStart.slice) */

  return (
    <Panel header={props.day}>
      <div className={`${styles.panelHeader} ${styles.panelTopHeader}`}>
        From: &nbsp;&nbsp;&nbsp;
        <select value={fromValue} onChange={handleFromChange} disabled={(isNotAvailable || isFullShifted)}>
        {
        timeOptions.map((option) => {
          return (
          <option 
            key={`${option}-${props.day}-from`} value={option}>
              {option}
          </option>)
        })
      }
        </select>
      </div>

      <div className={styles.panelHeader}>
        To: &nbsp;&nbsp;&nbsp;
        <select value={toValue} onChange={handleToChange} disabled={(isNotAvailable || isFullShifted)}> 
        {
        timeOptions.map((option) => {
          return (<option key={`${option}-${props.day}-to`} value={option}>{option}</option>)
        })
      }
        </select>
      </div>

      <div className={styles.panelHeader}>
        <input 
          type="checkbox" 
          id={`notAvailable+${props.day}`} 
          name="isNotAvailable" 
          value="1" 
          checked={isNotAvailable}
          onChange={handleNotAvailableChange}
        />
        <label htmlFor={`notAvailable+${props.day}`}> Not Available </label><br/>

        <input 
          type="checkbox" 
          id={`AvailableAllDay+${props.day}`} 
          name="AvailableAllDay" 
          value="1"
          checked={isFullShifted}
          onChange={handleAllDayChange}
        />
        <label htmlFor={`AvailableAllDay+${props.day}`}> Available all day </label>
      </div>
    </Panel>
  )
}



function TimeOffRequestPanelContainer(props){
  return (
    <div className={styles.panelsContainer}>
      <TimeOffRequestPanel />
      <TimeOffRequestViewerPanel />
  </div>
  )
}

function TimeOffRequestPanel(props){
  const avaObj = getObjContext();
  const torCaller = getTimeOffRequestCall();

  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const [toggleApiCall, setToggleApiCall] = useState("init");

  useEffect(() => {
    if (toggleApiCall == "init" || toggleApiCall == false){
      return;
    }

    let obj = {
      empID: avaObj.empID,
      startTime: fromValue,
      endTime: toValue
    }

    async function callApi(){
      await torCaller(obj);
    }

    callApi();

    setFromValue('');
    setToValue('');
    setToggleApiCall(false);
  }, [toggleApiCall]);

  const submitRequest = () => {
    setToggleApiCall(true);
  }

  const handleFromChange = (event) => {
    setFromValue(event.target.value);
  }

  const handleToChange = (event) => {
    setToValue(event.target.value);
  }

  let buttons = {
    0: {
      func: submitRequest,
      text: "Submit Request"
    }
  }

  return (
    <Panel header="Request Time Off">
      <div className={`${styles.panelHeader} ${styles.panelTopHeader}`}>
        From: <input type="date" value={fromValue} onChange={handleFromChange} />
      </div>
      <div className={`${styles.panelHeader} ${styles.panelTopHeader}`}>
        To: <input type="date" value={toValue} onChange={handleToChange} />
      </div>

      <ButtonBox buttons={buttons} />
    </Panel>
  )
}

function TimeOffRequestViewerPanel(props){
  const avaObj = getObjContext();
  const shouldDisp = avaObj.timeOffRequests && Object.keys(avaObj.timeOffRequests).length > 0;

  if (!shouldDisp){
    return null;
  }

  return(
    <Panel header="Your Time Off Requests" addClass={styles.panelSpace}>
      <div className={styles.shiftTradeDispBody}>
        {shouldDisp ? (
          Object.keys(avaObj.timeOffRequests).map((prop) => (
            <PendingTimeOffRequest 
              key={avaObj.timeOffRequests[prop].ID}
              startTime={avaObj.timeOffRequests[prop].startTime}
              endTime={avaObj.timeOffRequests[prop].endTime}
              ID={avaObj.timeOffRequests[prop].ID}
              approveStatus={avaObj.timeOffRequests[prop].approvedBySupervisor}
              empID={avaObj.empID}
            />
          ))
        ) : (
          "hi"
        )}
      </div>
    </Panel>
  )
}

function PendingTimeOffRequest(props){
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
      await callLocalUpdate(empID);
    }

    callapi(props.ID, props.empID);

  }, [toggleCancel]);

  useEffect(() => {
    if (fakeoutToggleCancel == "bhopping"){
      return;
    }

    setCancelButton(<Link href="#" className={styles.confirmButton} onClick={startCancelProcess}>Confirm.</Link>);


  },[fakeoutToggleCancel]);

  let statusString;

  if (props.approveStatus == null){
    statusString = "Waiting for manager approval";
  } else if (props.approveStatus == false ) {
    statusString = "Request Denied"
  } else {
    statusString = "Approved!";
  }



  return(
    <div className={styles.pendingShiftChangeContainer}>
      <div className={styles.pendingShiftChange}>
        <b>Days off</b>: {`${dispLocalDate(props.startTime)} to ${dispLocalDate(props.endTime)}`}
      </div>

      <div className={styles.pendingShiftChangeStatus}>
        <b>Status</b>: {statusString}
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

  try {
    const response = await fetch('/api/timeoff/cancel/' + shiftChangeID, {
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

function generateTimeOptions() {
  const options = [];
  for (let hour = 8; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour == 22 && minute ==30){
        continue;
      }
        const period = hour < 12 ? 'AM' : 'PM';
        const hour12Format = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const time = `${padZero(hour12Format)}:${padZero(minute)} ${period}`;
        options.push(time);

    }
  }
  return options;
}

function padZero(num) {
  return num.toString().padStart(2, '0');
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
/*     console.log('USERWORKS:', user); */
    userData = {
      username: user.props.user.username,
      role: user.props.user.role,
      empName: user.props.user.empName,
    };
  } else {
/*     console.log('LMAOHERE:', user); */
  }

  let employeeLoggedIn = {
    id: userData.username,
    isSupervisor: (userData.role == "Manager") ? true : false
  };

  let availability = await callDatabase("SELECT * FROM availability WHERE empID = ?", [employeeLoggedIn.id]);
  if (availability == -1) {
    availability = [];
  }
  let timeOffRequests = await callDatabase("SELECT * FROM time_off_requests WHERE empID = ?", [employeeLoggedIn.id]);
  if (timeOffRequests == -1){
    timeOffRequests = [];
  }


  let avaObj = {
    empID: employeeLoggedIn.id,
    availability,
    timeOffRequests
  };

/*   console.log(avaObj); */

  avaObj = JSON.stringify(avaObj);
  
  return {
    props: {
      employeeLoggedIn,
      avaObj
    }
  }
}