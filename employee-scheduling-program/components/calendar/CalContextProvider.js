import React, {useContext, useState} from 'react';

// create contexts
const ObjectContext = React.createContext();
const ModalContext = React.createContext();
const UpdateInfoContext = React.createContext();
const addScheduleItemContext = React.createContext();
const deleteScheduleItemContext = React.createContext();
const resetScheduleContext = React.createContext();
const empNameContext = React.createContext();

// functions to pass contexts to other components
export function getObjContext() {
  return useContext(ObjectContext);
}

export function getModalContext() {
  return useContext(ModalContext);
}

export function getUpdateInfoContext() {
  return useContext(UpdateInfoContext);
}

export function getAddScheduleItemContext() {
  return useContext(addScheduleItemContext);
}

export function getDeleteScheduleItemContext() {
  return useContext(deleteScheduleItemContext);
}

export function getEmpNameFunction() {
  return useContext(empNameContext);
}

export function getResetScheduleContext(){
  return useContext(resetScheduleContext);
}

// actual context provider wrapper
export function CalContextProvider({children, obj}){

  console.log("INIT OBJ: ", obj);

  const [objState, setObjState] = useState(obj);
  const [modalState, setModalState] = useState(false);

  const updateObject = async (selector) => {
    let newInfo = await callUpdateAPI(selector, objState.userID);
    
    setObjState((prevValues) => ({
      ...prevValues,
      [selector]: newInfo
    }));
  };

  const newScheduleItem = async (empID, startTime, endTime) => {
    const DempID = "10003";
    const DstartTime = new Date(2023, 6, 14, 12, 30, 0);
    const DendTime = new Date(2023, 6, 14, 17, 30, 0);

    await addScheduleItemAPI(empID, startTime, endTime);

    await updateObject("items");
  };

  const deleteScheduleItem = async (itemID) => {
    await deleteScheduleItemAPI(itemID);
    await updateObject("items");
  }

  const resetSchedule = async (headerID) => {
    console.log("ghetter: ", headerID);
    await resetScheduleByHeaderIDAPI(headerID);
    await updateObject("items");
  }

  const getEmployeeeShortName = (id) => {
    const emp = objState.employees.find(item => item.ID === parseInt(id));

    return `${emp.firstName} ${emp.lastName.at(0)}.`;
  }

  return (
    <ObjectContext.Provider value={objState}>
      <ModalContext.Provider value={modalState}>
        <UpdateInfoContext.Provider value={updateObject}>
          <addScheduleItemContext.Provider value={newScheduleItem}>
            <deleteScheduleItemContext.Provider value={deleteScheduleItem}>
              <empNameContext.Provider value={getEmployeeeShortName}>
                <resetScheduleContext.Provider value={resetSchedule}>
                                                {children}
                </resetScheduleContext.Provider>
              </empNameContext.Provider>                                    
            </deleteScheduleItemContext.Provider>
          </addScheduleItemContext.Provider>
        </UpdateInfoContext.Provider>
      </ModalContext.Provider>
    </ObjectContext.Provider>
  )
}

async function addScheduleItemAPI(empID, startTime, endTime) {
  const payload = {
    empID: empID,
    startTime: startTime,
    endTime: endTime,
  };

/*   console.log("PAYLOAD: ", payload); */

  try {
    const response = await fetch('/api/calendar/item/new', {
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

async function deleteScheduleItemAPI(itemID) {
  try {
    const response = await fetch('/api/calendar/item/delete/' + itemID, {
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

async function resetScheduleByHeaderIDAPI(headerID){
  try {
    const response = await fetch('/api/schedule/reset/' + headerID, {
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

async function callUpdateAPI(selector, empID){
  let apiPath;

  switch (selector){
    case "pendingShiftChangeRequests":
      apiPath = '/api/shifttrade/user/requester/' + empID;
      break;
    case "items":
      apiPath = '/api/calendar/items/' + empID;
      break;
    default:
      return null;
  }

  const response = await fetch(apiPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    credentials: "same-origin"
  });

  const data = await response.json();

  return data;
}