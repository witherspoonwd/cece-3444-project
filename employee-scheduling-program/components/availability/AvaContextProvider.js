import React, {useContext, useState} from 'react';
import { convertTimeString } from '@/lib/availability/convertTimeString';

// create contexts
const ObjectContext = React.createContext();
const availabilityCall = React.createContext();
const timeOffRequestCall = React.createContext();
const updateTimeOffRequestsContext = React.createContext();

// functions to pass contexts to other components
export function getObjContext() {
  return useContext(ObjectContext);
}

export function getAvailabilityCall(){
  return useContext(availabilityCall)
}

export function getTimeOffRequestCall() {
  return useContext(timeOffRequestCall);
}

export function getUpdateInfoContext() {
  return useContext(updateTimeOffRequestsContext);
}

// actual context provider wrapper
export function AvaContextProvider({children, obj}){

  const [objState, setObjState] = useState(obj);
  const [modalState, setModalState] = useState(false);

  console.log("OBJ LOADED: ", objState);

  const handleAvailabilityCall = async (obj) => {

    console.log("handler obj: ", obj, "time: ", new Date());
    let startTime, endTime, day, empID;

    day = obj.day;
    empID = obj.empID;

    if (obj.isFullShifted){
      startTime = "00:00:00";
      endTime= "23:59:00";
    } else if (obj.isNotAvailable) {
      startTime = "none";
      endTime = "none";
    } else {
      startTime = convertTimeString(obj.startTime, "db");
      endTime = convertTimeString(obj.endTime, "db");
    }

    await callAvailabilityAPI(startTime, endTime, day, empID);

    let newData = await updateAvailabilityItems(empID);
    
    setObjState((prevValues) => ({
      ...prevValues,
      availability: newData
    }));

  };

  const handleTimeOffRequestCall = async (obj) => {
    console.log("call obj: ", obj);

    if (obj.startTime === '' || obj.endTime === ''){
      console.log("err");
      return;
    }

    let startTime = obj.startTime + " 00:00:00";
    let endTime = obj.endTime + " 23:59:00";
    let empID = obj.empID;

    await callTimeOffRequestAPI(startTime, endTime, empID);

    let newData = await updateTimeOffRequests(empID);
    
    setObjState((prevValues) => ({
      ...prevValues,
      timeOffRequests: newData
    }));
  };

  const updateTimeOffRequestsLocal = async (empID) => {
    let newData = await updateTimeOffRequests(empID);
    
    setObjState((prevValues) => ({
      ...prevValues,
      timeOffRequests: newData
    })); 
  };

  return (
    <ObjectContext.Provider value={objState}>
      <availabilityCall.Provider value={handleAvailabilityCall}>
        <timeOffRequestCall.Provider value={handleTimeOffRequestCall}>
          <updateTimeOffRequestsContext.Provider value={updateTimeOffRequestsLocal}>
                                                {children}
          </updateTimeOffRequestsContext.Provider>
        </timeOffRequestCall.Provider>
      </availabilityCall.Provider>
    </ObjectContext.Provider>
  )
}

async function callAvailabilityAPI(startTime, endTime, day, empID){
  const payload = {
    empID: empID,
    startTime: startTime,
    endTime: endTime,
    weekday: day
  };

  console.log("payload: ", payload);

/*   console.log("PAYLOAD: ", payload); */

  try {
    const response = await fetch('/api/availability/handle', {
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

async function updateAvailabilityItems(empID){
  let apiPath = '/api/availability/items/' + empID;

  const response = await fetch(apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    credentials: "same-origin"
  });

  const data = await response.json();

  return data;
}

async function callTimeOffRequestAPI(startTime, endTime, empID){
  const payload = {
    empID: empID,
    startTime: startTime,
    endTime: endTime,
  };

  console.log("payload: ", payload);

/*   console.log("PAYLOAD: ", payload); */

  try {
    const response = await fetch('/api/timeoff/new', {
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

async function updateTimeOffRequests(empID){
  let apiPath = '/api/timeoff/items/' + empID;

  const response = await fetch(apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    credentials: "same-origin"
  });

  const data = await response.json();

  return data;

}