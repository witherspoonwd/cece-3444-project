// main imports
import Image from 'next/image';
import Link from 'next/link';

// react imports
import { Fragment } from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
// stylesheet imports
import styles from '@/styles/home.module.css';

// component import

import NavBar from "@/components/navbar.js";
import {Panel} from "@/components/general_components/panel";
import { withSessionSsr } from '@/lib/config/withSession';
import { callDatabase } from '@/lib/backend/databaseCall';
import { dispLocalDate, dispLocalTime, dispLocalDateWithDay } from '@/lib/dispLocalDate';
import { startOfWeek, endOfWeek, format } from 'date-fns';
import { Modal } from "@/components/general_components/modal";
import { ButtonBox } from "@/components/general_components/buttonsBox";


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

export default function Home(props) {
  const [role, setRole] = useState(props.data.user.role);
  const [empName, setEmpName] = useState(props.data.user.empName);
  const [id, setId] = useState(props.data.user.username);
  const [schedule, setSchedule] = useState(props.data.schedule);
  const [announcements, setAnnouncements] = useState(props.data.announcements);
  const [employeeOTW, setEmployeeOTW] = useState(props.data.employeeOfTheWeek);
  //const [employees, setEmployees] = useState(props.data.employees);
  //console.log("Employees: ", props.data.employees);
  
  const updateEmployeeOTW = (newEmployeeOTW) => {
	  setEmployeeOTW(newEmployeeOTW);
  };
  
  const updateAnnouncements = (announcements) => {
	  const newAnnouncements = JSON.stringify(announcements);
	  setAnnouncements(newAnnouncements);
  };
  
  return (
    <Fragment>
        <Fragment>
          <NavBar role={role} empName={empName} id={id}/>
          <HomePageContainer role={role} schedule={schedule} empName={empName} id={id} announcements={announcements} updateAnnouncements={updateAnnouncements} employeeOTW={employeeOTW} employees={props.data.employees} updateEmployeeOTW={updateEmployeeOTW}/>
        </Fragment>
    </Fragment>
  )
}


function HomePageContainer(props) {
  return (
    <div class={styles.homePageContainer}>
	  <TopBox role={props.role} schedule={props.schedule} empName={props.empName} employeeOTW={props.employeeOTW} employees={props.employees} updateEmployeeOTW={props.updateEmployeeOTW}/>
      <BottomBox role={props.role} empName={props.empName} id={props.id} announcements={props.announcements} updateAnnouncements={props.updateAnnouncements}/>
    </div>
  )
}

function TopBox(props) {
  return (
    <div className={styles.topBox}>
      <WelcomeBox empName={props.empName}/>
      <TopPanels role={props.role} schedule={props.schedule} employeeOTW={props.employeeOTW} employees={props.employees} updateEmployeeOTW={props.updateEmployeeOTW}/>
    </div>
  )
}

function TopPanels(props) {
  return (
    <div className={`${styles.topPanels} ${styles.containerPadding}`}>
      <ScheduleSummary schedule={props.schedule}/>
      <EmployeeOfTheWeek role={props.role} employeeOTW={props.employeeOTW} employees={props.employees} updateEmployeeOTW={props.updateEmployeeOTW}/>
    </div>
  )
}

function BottomBox(props) {
  return (
    <div className={styles.bottomBox}>
      <SelectionBoxContainer role={props.role} empName={props.empName} id={props.id}/>
      <NotificationPanel role={props.role} announcements={props.announcements} updateAnnouncements={props.updateAnnouncements}/>
    </div>
  )
}

function ScheduleSummary(props) {
	console.log("Schedule: ", props.schedule);
	const schedules = JSON.parse(props.schedule);
	if(!Array.isArray(schedules) || schedules.length === 0) {
	  return (
		<Panel addClass={styles.topPanelWidths} header="Schedule at a glance">
		  <div className={styles.scheduleSummaryTableContainer}>
			Not scheduled for the week currently
		  </div>
		</Panel>
	  )
	}
	else
	{
	  const schedules = JSON.parse(props.schedule);
	  console.log("Schedule: ", props.schedule);
	  return (
		<Panel addClass={styles.topPanelWidths} header="Schedule at a glance">
		  <div className={styles.scheduleSummaryTableContainer}>
			<table>
			  <tbody>
				{schedules.map((schedule, index) => (
				  <tr key={index}>
					<td className={styles.scheduleSummaryTableSpace}>{dispLocalDateWithDay(schedule.startTime)}</td>
					<td>{dispLocalTime(schedule.startTime)} - {dispLocalTime(schedule.endTime)}</td>
				  </tr>
				))}
			  </tbody>
			</table>
		  </div>
		</Panel>
	  )
	}
}

function EmployeeOfTheWeek(props) {
	const currentDate = new Date();
	const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }); // Assuming week starts on Monday (use { weekStartsOn: 0 } if it starts on Sunday)
	const formattedStartOfCurrentWeek = format(startOfCurrentWeek, 'MM.dd.yy');
	const initEmployeeID = props.employeeOTW[0].ID;
	const firstName = props.employeeOTW[0].firstName;
	const lastName = props.employeeOTW[0].lastName;
	const employeeOTW = props.employeeOTW[0];
	const profilePic = props.employeeOTW[0].profilePic;
	const role = props.role;
	const employees = props.employees;
	const sortedEmployees = employees.sort((a, b) => a.lastName.localeCompare(b.lastName));
	const [modalState, setModalState] = useState(null);
	const [currentEmployeeOTW, setCurrentEmployeeOTW] = useState(props.employeeOTW[0]);
	  
	console.log("EmployeeOTW: ", employeeOTW);
	console.log("Employees: ", sortedEmployees);
	
	const disableModal = () => {
	  setModalState(null);
	};
	
	const handleEditEmployeeOfTheWeek = () => {
		setModalState(
			<EmployeeOTWModal
				employeeOTW={employeeOTW}
				employees={sortedEmployees}
				toggleFunction={disableModal}
				updateEmployeeOTW={props.updateEmployeeOTW}
			/>
		);
	};
	
	if(role === "Manager") {
		return(
			<Panel addBodyClass={styles.empWeekPanelBody} addClass={styles.topPanelWidths} header="Employee of the week!">
				<div className={styles.empWeekSubtitle}>Week of {formattedStartOfCurrentWeek}</div>
					<div className={styles.empWeekImageContainer}>
						<img src={profilePic}/>
					</div>
					<div className={styles.empWeekEmployeeName}>
						{firstName} {lastName}
					</div>
					<div className={styles.addEmployeeOfTheWeekButton} onClick={handleEditEmployeeOfTheWeek}>
					  +
					</div>
				{modalState}
			</Panel>
		)
	} else {
		return(
			<Panel addBodyClass={styles.empWeekPanelBody} addClass={styles.topPanelWidths} header="Employee of the week!">
				<div className={styles.empWeekSubtitle}>Week of {formattedStartOfCurrentWeek}</div>
					<div className={styles.empWeekImageContainer}>
						<img src={profilePic}/>
					</div>
					<div className={styles.empWeekEmployeeName}>
						{firstName} {lastName}
					</div>
			</Panel>
			)
	}
}

function EmployeeOTWModal(props) {
	const [selectedEmployee, setSelectedEmployee] = useState(null);
	const [saveToggle, setSaveToggle] = useState("init");
	const initEmployeeID = props.employeeOTW.ID;
	
	const toggleSave = async () => {
		setSaveToggle(true);
		
		//props.updateEmployeeOTW(selectedEmployee);
	};

	const handleChangeEmployee = (event) => {
		setSelectedEmployee(event.target.value);
		console.log("New Employee: ", selectedEmployee);
	};
	
	let buttons = {
		0: {
			func: props.toggleFunction,
			text: "Cancel"
		},
		1: {
			func: toggleSave,
			text: "Save"
		}
	};
	
	useEffect(() => {		  
		if (saveToggle === "init" || saveToggle === false)
		{
			return;
		}
		let newEmployee = '';
		async function callapi() {
			await submitEmployeeOTWChangeAPI(initEmployeeID, selectedEmployee);
			newEmployee = await returnEmployeeOTWAPI(selectedEmployee);
			console.log("New Employee: ", newEmployee);
			if(newEmployee !== '')
			{
				props.updateEmployeeOTW(newEmployee);
			}
		};
			  
		callapi();
			
		//console.log("New Employee: ", newEmployee);
		setSelectedEmployee(null);	 
		props.toggleFunction();
	}, [saveToggle]);
	
	return (
		<Modal toggleFunction={props.toggleFunction}>
		  <Panel header="Edit Employee of the Week" addClass={styles.extendModalPanel}>
			<div>
			  <select onChange={handleChangeEmployee} value={selectedEmployee?.ID}>
				<option value="" disable>
				  -- Select Employee --
				</option>
				{props.employees.map((employee) => (
				  <option key={employee.ID} value={employee.ID}>
					{employee.lastName}, {employee.firstName}
				  </option>
				))}								
			  </select>
			<ButtonBox buttons={buttons}/>
			</div>
		  </Panel>
		</Modal>
	);
}

async function submitEmployeeOTWChangeAPI(initEmployeeID, selectedEmployee) {
	const oldID = initEmployeeID;
	
	const payload = {
		oldID: initEmployeeID,
		newID: selectedEmployee,
	};
	
	try {
		const response = await fetch('api/employeeOTW/edit/'+oldID, {
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

async function returnEmployeeOTWAPI(selectedEmployee) {
	const newID = selectedEmployee;
	
	let apiPath;

	apiPath = '/api/employeeOTW/return/'+newID;


	const response = await fetch(apiPath, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		credentials: "same-origin"
	});

	const data = await response.json();

	console.log("Data: ", data);
	return data;
}

function NotificationPanel(props) {
  const Announcements = JSON.parse(props.announcements);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [content, setContent] = useState('');
  const [addModalState, setAddModalState] = useState(null);
  const role = props.role;
  //const [viewModalState, setViewModalState] = useState(null);
  
  const disableModal = () => {
	  setAddModalState(null);
  };

  const handleAddAnnouncement = () => {
	  setAddModalState(
		<NotificationModal
			toggleFunction={disableModal}
			updateAnnouncements={props.updateAnnouncements}
		/>
		);
  };

  if(role === "Manager") {
	  if (!Array.isArray(Announcements) || Announcements.length === 0) {
		return (
		  <div className={`${styles.notificationPanelContainer} ${styles.containerPadding}`}>
			<Panel header="Announcements" addClass={styles.notificationPanelMods} replaceBodyClass={styles.notificationPanelBodyMods}>
				No Announcements currently
				<div className={styles.addAnnouncementButton} onClick={handleAddAnnouncement}>
					+
				</div>
				{addModalState}
			</Panel>
		  </div>
		);
	  } else {
		return (
		  <div className={`${styles.notificationPanelContainer} ${styles.containerPadding}`}>
			<Panel header="Announcements" addClass={styles.notificationPanelMods} replaceBodyClass={styles.notificationPanelBodyMods}>
			  {Announcements.map((announcement, index) => (
				<NotificationItem key={index} {...announcement} />
			  ))}
			  <div className={styles.addAnnouncementButton} onClick={handleAddAnnouncement}>
				+
			  </div>
			  {addModalState}
			</Panel>
		  </div>
		);
	  }
    } else {
		if (!Array.isArray(Announcements) || Announcements.length === 0) {
		return (
		  <div className={`${styles.notificationPanelContainer} ${styles.containerPadding}`}>
			<Panel header="Announcements" addClass={styles.notificationPanelMods} replaceBodyClass={styles.notificationPanelBodyMods}>
				No Announcements currently
			</Panel>
		  </div>
		);
	  } else {
		return (
		  <div className={`${styles.notificationPanelContainer} ${styles.containerPadding}`}>
			<Panel header="Announcements" addClass={styles.notificationPanelMods} replaceBodyClass={styles.notificationPanelBodyMods}>
			  {Announcements.map((announcement, index) => (
				<NotificationItem key={index} {...announcement} />
			  ))}
			</Panel>
		  </div>
		);
	  }
	}
}

function NotificationModal(props) {
	const [submitToggle, setSubmitToggle] = useState("init");
	const [title, setTitle] = useState('');
	const [date, setDate] = useState('');
	const [content, setContent] = useState('');	
	
	const toggleSubmit = async () => {
		setSubmitToggle(true);
	};
	
	let buttons = {
		0: {
			func: props.toggleFunction,
			text: "Cancel"
		},
		1: {
			func: toggleSubmit,
			text: "Submit"
		}
	};
	
	useEffect(() => {
		if(submitToggle === "init" || submitToggle === false)
		{
			return;
		}
		
		let announcements = '';
		async function callapi() {
			await submitAnnouncementAPI(title, date, content);
			announcements = await returnAnnouncementsAPI(title);
			
			if(announcements !== '')
			{
				props.updateAnnouncements(announcements);
			}
		};
		
		callapi();
		
		props.toggleFunction();
	}, [submitToggle]);
	
	return (
		<Modal toggleFunction={props.toggleFunction}>
		  <Panel header="Add Announcement" addClass={styles.extendAnnouncementModal}>
		    <div>
				<div>
				  Title:
				</div>
				<input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.titleInput}/>

				<div>
				  Date:
				</div>
				<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={styles.dateInput} />

				<br />
				<div>
				  Content:
				</div>
				<textarea value={content} onChange={(e) => setContent(e.target.value)} className={styles.contentTextarea}/>

				
			<ButtonBox buttons={buttons}/>
			</div>
		  </Panel>
		</Modal>
	);
}

async function submitAnnouncementAPI(title, date, content) {
	const payload = {
		title: title,
		date: date,
		content: content,
	};
	
	try {
		const response = await fetch('api/announcements/add/'+title, {
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

async function returnAnnouncementsAPI(title) {
	let apiPath;

	apiPath = '/api/announcements/return/'+title;


	const response = await fetch(apiPath, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json'},
		credentials: "same-origin"
	});

	const data = await response.json();

	console.log("Data: ", data);
	return data;
}

function NotificationItem(props) {
  
  const [modalState, setModalState] = useState(null);
  
  const disableModal = () => {
	  setModalState(null);
  };
  
  const handleViewAnnouncement = () => {
	  setModalState(
		<ViewNotificationModal
			title={props.title}
			date={props.time_date}
			content={props.content}
			toggleFunction={disableModal}
		/>
	  );
  };
  
	const maxLength = 120;
	const { title, date, content } = props;
	
  const truncateContent = (content, maxLength) => {
    if (content.length <= maxLength) {
      return content;
    } else {
      return content.slice(0, maxLength) + "...";
    }
  };
	
  return (
    <div className={styles.notificationPanelItemContainer}>
      <div className={styles.notificationPanelItemHeader}>
        <div className={styles.notificationPanelItemTitle}>
          {props.title}
        </div>
        <div className={styles.notificationPanelItemDate}>
          {dispLocalDate(props.time_date)}
        </div>
      </div>
      <div className={styles.notificationPanelItemPreview}>
        {truncateContent(content, maxLength)}
      </div>
      <div className={styles.psuedoLink} onClick={handleViewAnnouncement}>
        View full announcement
      </div>
	  {modalState}
    </div>
  )
}

function ViewNotificationModal(props) {
	let buttons = {
		0: {
			func: props.toggleFunction,
			text: "Close"
		}
	};
	
	
	return (
		<Modal toggleFunction={props.toggleFunction}>
		  <Panel header={props.title} addClass={styles.extendViewAnnouncementModal}>
		    <div>
			  <div className={styles.notificationPanelItemDate}>
				{dispLocalDate(props.date)}
			  </div>
			  <br />
			  <div className={styles.notificationPanelContentPreview} style={{ wordWrap: "break-word" }}>
				{props.content}
			  </div>
			<ButtonBox buttons={buttons}/>
			</div>
		  </Panel>
		</Modal>
	);
	
	
}

function WelcomeBox(props){
  return(
    <div class={`${styles.welcomeMessage} ${styles.containerPadding}`}>
      Welcome, <br /> {props.empName}!
    </div>
  )
}

function SelectionBoxContainer(props){
  return (
    <div class={`${styles.selectionBoxContainer} ${styles.containerPadding}`}>
      <SelectionBox header="View work schedule" href={`/calendar?role=${props.role}&empName=${props.empName}&id=${props.id}`}/>
      <SelectionBox header="Request time off" href={`/availability?role=${props.role}&empName=${props.empName}&id=${props.id}`}/>
      <SelectionBox header="Contact your coworkers" href={`/addressbook?role=${props.role}&empName=${props.empName}&id=${props.id}`}/>
    </div>
  );
}

function SelectionBox(props){
  return (
    <Panel addClass={styles.fixedPanelWidth} replaceBodyClass={styles.selectionBoxBody} hoverablePanel={true} noPadding={true}>
      <Link href={props.href} className={styles.selectionBoxLink}>
        <div className={styles.selectionBoxHeader}>
          {props.header}
        </div>

        <div className={styles.selectionBoxImage}>
          <img src="circle-arrow.svg"/>
        </div>
      </Link>
    </Panel>
  );
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
    console.log('USERWORKS:', user);
    userData = {
      username: user.props.user.username,
      role: user.props.user.role,
      empName: user.props.user.empName,
    };
  } else {
    console.log('LMAOHERE:', user);
  }

  // Get the start and end dates for the current week
  const currentDate = new Date();
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 0 }); // Assuming week starts on Monday (use { weekStartsOn: 0 } if it starts on Sunday)
  const endOfCurrentWeek = endOfWeek(currentDate, { weekStartsOn: 0 });

  // Format the dates as strings in "YYYY-MM-DD" format for the SQL query
  const formattedStartOfCurrentWeek = format(startOfCurrentWeek, 'yyyy-MM-dd');
  const formattedEndOfCurrentWeek = format(endOfCurrentWeek, 'yyyy-MM-dd');

  // SQL query to retrieve the schedule for the current week
  const query1 = `
    SELECT startTime, endTime
    FROM schedule_items
    WHERE empID = ? AND startTime >= ? AND endTime <= ?
  `;
  const values1 = [user.props.user.username, formattedStartOfCurrentWeek, formattedEndOfCurrentWeek];

  // Execute the SQL query
  const result1 = await callDatabase(query1, values1);
  
  console.log("Schedule: ", result1);
  const schedule = JSON.stringify(result1);

  // Fetch the data for other home components here (announcements, employee of the week, etc.)
  const query2 = "SELECT * FROM Announcements";
  
  const result2 = await callDatabase(query2);
  const announcements = JSON.stringify(result2);
  
  console.log("Announcements: ", announcements);
  
  const query3 = "SELECT ID, firstName, lastName, profilePic FROM employees WHERE isEmployeeOfTheWeek = true";
  const result3 = await callDatabase(query3);
  const employeeOfTheWeek = result3;
  console.log("Employee Of The Week: ", employeeOfTheWeek);
  
  const query4 = "SELECT ID, firstName, lastName FROM employees";
  const result4 = await callDatabase(query4);
  const employees = result4;
  //console.log("Employees: ", employees);
  // Combine the fetched data into an object to be passed as props
  const data = {
    schedule,
    announcements,
    employeeOfTheWeek,
	employees,
    user: userData,
  };

  return {
    props: {
      data,
    },
  };
}
