import React, { Fragment, useState, useEffect } from 'react';
import NavBar from '@/components/navbar.js';
import { callDatabase } from '@/lib/backend/databaseCall';
import { getEmployeeNameById } from '@/lib/backend/getEmployeeNameById';
import { Panel } from '@/components/general_components/panel';
import axios from 'axios';
import styles from '@/styles/approval.module.css';
import { useRouter } from 'next/router';
import { withSessionSsr } from '@/lib/config/withSession';

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

function dispLocalDate(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear().toString().substr(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'pm' : 'am';
  let hour = date.getHours();
  hour = hour % 12 === 0 ? 12 : hour % 12;
  const formattedDate = `${month}.${day}.${year} ${hour.toString().padStart(2, '0')}:${minutes}${ampm}`;
  return formattedDate;
}

export default function ShiftChange({ shiftChangeRequests, timeOffRequests, personalShiftChangeRequests }) {
	console.log("Check 1");
	const { query: { role, empName, id } } = useRouter();
  return (
    <Fragment>
      <NavBar role={role} empName={empName} id={id}/>
	  {role==="Manager" ? (
		<ApprovalPageContainer shiftChangeRequests={shiftChangeRequests} timeOffRequests={timeOffRequests} role={role}/>
	  ) : (<PersonalRequestPageContainer shiftChangeRequests={personalShiftChangeRequests} role={role}/>)
	  }
	</Fragment>
  );
}

function PersonalRequestPageContainer({ shiftChangeRequests, role }) {
	return (
		<div>
			<TopBox shiftChangeRequests={shiftChangeRequests} role={role} />
		</div>
	);
}
function ApprovalPageContainer({ shiftChangeRequests, timeOffRequests, role }) {
  return (
    <div>
      <TopBox shiftChangeRequests={shiftChangeRequests} role={role} />
      <BottomBox timeOffRequests={timeOffRequests} role={role}/>
    </div>
  );
}

function TopBox({ shiftChangeRequests, role }) {
  return (
    <div className={`${styles.topBox} ${styles.containerPadding}`}>
      <ShiftChangeContainer shiftChangeRequests={shiftChangeRequests} role={role} />
    </div>
  );
}

function BottomBox({ timeOffRequests, role }) {
  return (
    <div className={`${styles.bottomBox} ${styles.containerPadding}`}>
      <TimeOffContainer timeOffRequests={timeOffRequests} role={role} />
    </div>
  );
}

function ShiftChangeContainer({ shiftChangeRequests, role }) {
	const [requests, setRequests] = useState(shiftChangeRequests);
	
  return (
    <div className={`${styles.notificationPanelContainer} ${styles.containerPadding}`}>
      <Panel header="Shift Change Requests" addClass={styles.notificationPanelMods} replaceBodyClass={styles.notificationPanelBodyMods}>
        <ShiftChangeNotificationItems shiftChangeRequests={requests} setShiftChangeRequests={setRequests} role={role} />
      </Panel>
    </div>
  );
}

function ShiftChangeNotificationItems({ shiftChangeRequests, setShiftChangeRequests, role }) {
	
	if(shiftChangeRequests === "[]") {
		return (
		<div>
			No Shift Change Requests Currently
		</div>
		);
	} else {
		const Requests = JSON.parse(shiftChangeRequests);

		return (
		<div>
			{Requests.map((Request, index) => (
				<SCNotificationItem key={index} role={role}
				{...Request}
				setShiftChangeRequests={setShiftChangeRequests}
				/>
			))}
		</div>
		);
	}
}

function SCNotificationItem(props) {
  const [accepted, setAccepted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [shiftId, setShiftId] = useState(props.shiftID);
  const [traderEmpId, setTraderEmpId] = useState(props.traderEmpID);
  const [tradeeEmpId, setTradeeEmpId] = useState(props.tradeeEmpID);
  
  //console.log("EmpID: ", empId);

  const handleAccept = async() => {
		console.log("************");
		await submitShiftChangeApprovalAPI(shiftId, traderEmpId, tradeeEmpId);
		setAccepted(true);
  };

  const handleDeny = async() => {
		await submitShiftChangeDenyAPI(shiftId, traderEmpId);
		setDenied(true);
  };

  const handleAcceptUpdate = async () => {
	console.log("Herefool");
	try {
		const payload = { shiftId };
		await axios.post('/api/shifttrade/approve/acceptTradeeShift', payload);
	  } catch (error) {
		console.error('Error updating profile:', error);
	  }
	setAccepted(true);
  }

  const handleDenyUpdate = async () => {
	try {
		const payload = { shiftId };
		await axios.post('/api/shifttrade/deny/denyTradeeShift', payload);
	  } catch (error) {
		console.error('Error updating profile:', error);
	  }
	setDenied(true);
  }

  if(accepted)
  {
	  return (
		<div className={styles.notificationPanelItemContainer}>
			<div className={styles.notificationPanelItemHeader}>
				<div className={styles.notificationPanelItemTitle}>
					{`From ${props.traderName} to ${props.tradeeName}`}
				</div>
				<div className={styles.notificationPanelItemDate}>
					{`${dispLocalDate(props.startTime)} - ${dispLocalDate(props.endTime)}`}
				</div>
			</div>
			<div className={styles.AcceptDenyContainer}>
				<div>
					Accepted
				</div>
			</div>
		</div>
		);
  }
  
  if(denied)
  {
	  return (
		<div className={styles.notificationPanelItemContainer}>
			<div className={styles.notificationPanelItemHeader}>
				<div className={styles.notificationPanelItemTitle}>
					{`From ${props.traderName} to ${props.tradeeName}`}
				</div>
				<div className={styles.notificationPanelItemDate}>
					{`${dispLocalDate(props.startTime)} - ${dispLocalDate(props.endTime)}`}
				</div>
			</div>
			<div className={styles.AcceptDenyContainer}>
				<div>
					Denied
				</div>
			</div>
		</div>
		);
  }
  
  console.log(props.role);
  return (
    <div className={styles.notificationPanelItemContainer}>
      <div className={styles.notificationPanelItemHeader}>
        <div className={styles.notificationPanelItemTitle}>
          {`From ${props.traderName} to ${props.tradeeName}`}
        </div>
        <div className={styles.notificationPanelItemDate}>
          {`${dispLocalDate(props.startTime)} - ${dispLocalDate(props.endTime)}`}
        </div>
      </div>
		{props.role==="Manager" ? (
			<div className={styles.AcceptDenyContainer}>
        	<div className={styles.psuedoLink} onClick={handleAccept}>
          	Accept
        	</div>
			<div className={styles.psuedoLink} onClick={handleDeny}>
			Deny
			</div>
			</div>
		) : (
			<div className={styles.AcceptDenyContainer}>
			<div className={styles.psuedoLink} onClick={handleAcceptUpdate}>
			Accept
			</div>
			<div className={styles.psuedoLink} onClick={handleDenyUpdate}>
			Deny
			</div>
			</div>
		)
		}
      </div>
  );
}

function TimeOffContainer({ timeOffRequests }) {
  return (
    <div className={`${styles.notificationPanelContainer} ${styles.containerPadding}`}>
      <Panel header="Time Off Requests" addClass={styles.notificationPanelMods} replaceBodyClass={styles.notificationPanelBodyMods}>
        <TimeOffNotificationItems timeOffRequests={timeOffRequests} />
      </Panel>
    </div>
  );
}

function TimeOffNotificationItems({ timeOffRequests }) {
	if(timeOffRequests === "[]") {
		return(
		<div>
			No Time Off Requests Currently
		</div>
		);
	} else {
		const Requests = JSON.parse(timeOffRequests);

		return (
		<div>
			{Requests.map((Request, index) => (
				<TONotificationItem key={index} {...Request} />
			))}
		</div>
		);
	}
}

function TONotificationItem(props) {
  const [accepted, setAccepted] = useState(false);
  const [denied, setDenied] = useState(false);
  const [empID, setEmpID] = useState(props.empID);
  const [ID, setID] = useState(props.ID);
  
  console.log("ID: ", empID);

  const handleAccept = async() => {
		await submitTimeOffApprovalAPI(empID, ID);
		setAccepted(true);
  };

  const handleDeny = async() => {
		await submitTimeOffDenyAPI(empID, ID);
		setDenied(true);
  };

  if(accepted) {
	  return (
		<div className={styles.notificationPanelItemContainer}>
			<div className={styles.notificationPanelItemHeader}>
				<div className={styles.notificationPanelItemTitle}>
					{`Employee Name: ${props.empName}`}
				</div>
				<div className={styles.notificationPanelItemDate}>
					{`Start: ${dispLocalDate(props.startTime)} - End: ${dispLocalDate(props.endTime)}`}
				</div>
			</div>
			<div className={styles.AcceptDenyContainer}>
				Accepted
			</div>
		</div>
	  );
  }
  
  if(denied) {
	  return (
		<div className={styles.notificationPanelItemContainer}>
			<div className={styles.notificationPanelItemHeader}>
				<div className={styles.notificationPanelItemTitle}>
					{`Employee Name: ${props.empName}`}
				</div>
				<div className={styles.notificationPanelItemDate}>
					{`Start: ${dispLocalDate(props.startTime)} - End: ${dispLocalDate(props.endTime)}`}
				</div>
			</div>
			<div className={styles.AcceptDenyContainer}>
				Denied
			</div>
		</div>
	  );
  }
  
  

  return (
    <div className={styles.notificationPanelItemContainer}>
      <div className={styles.notificationPanelItemHeader}>
        <div className={styles.notificationPanelItemTitle}>
          {`Employee Name: ${props.empName}`}
        </div>
        <div className={styles.notificationPanelItemDate}>
          {`Start: ${dispLocalDate(props.startTime)} - End: ${dispLocalDate(props.endTime)}`}
        </div>
      </div>
      <div className={styles.AcceptDenyContainer}>
        <div className={styles.psuedoLink} onClick={handleAccept}>
          Accept
        </div>
        <div className={styles.psuedoLink} onClick={handleDeny}>
          Deny
        </div>
      </div>
    </div>
  );
}

async function submitShiftChangeApprovalAPI(shiftId, traderEmpId, tradeeEmpId) {
	
	const payload = {
		shiftID: shiftId,
		traderEmpID: traderEmpId,
		tradeeEmpID: tradeeEmpId,
	};
	
	console.log("Payload:", payload);
	
	try {
		const response = await fetch('/api/shifttrade/approve/'+shiftId, {
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

async function submitShiftChangeDenyAPI(shiftId, empId) {
	
	const payload = {
		shiftID: shiftId,
		empID: empId,
	};
	
	console.log("Payload: ", payload);
	
	try {
		const response = await fetch('api/shifttrade/deny/'+shiftId, {
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

async function submitTimeOffApprovalAPI(empID, ID) {
	
	const payload = {
		ID: ID,
		empID: empID,
	};
	
	try {
		const response = await fetch('api/timeoff/approve/'+ID, {
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

async function submitTimeOffDenyAPI(empID, ID) {
	
	const payload = {
		ID: ID,
		empID: empID,
	};
	
	try {
		const response = await fetch('api/timeoff/deny/'+ID, {
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



export async function getServerSideProps(context) {
  try {
	const user = await IronSessionCheck(context);
	if (user && user.redirect) {
		// Handle the redirection
		return {
		  redirect: user.redirect,
		};
	  }
	const { id } = context.query;
	//console.log('----------id: ', id);
    const query1 = 'SELECT scr.ID, scr.shiftID, scr.traderEmpID, scr.tradeeEmpID, scr.acceptedByTradee, scr.approvedBySupervisor, s.ID, s.startTime, s.endTime FROM shift_change_requests AS scr INNER JOIN schedule_items AS s ON scr.shiftID = s.ID WHERE scr.approvedBySupervisor IS NULL';
    const result1 = await callDatabase(query1);
	
	let SCRequests = [];
	if(Array.isArray(result1)) {
		//console.log("Result 1: ", result1);
		SCRequests = await Promise.all(
			result1.map(async (request) => {
				const traderName = await getEmployeeNameById(request.traderEmpID);
				const tradeeName = await getEmployeeNameById(request.tradeeEmpID);

				return {
				...request,
				traderName,
				tradeeName,
				};
			})
		);
	}
	//console.log("SC Requests: ", SCRequests);
	
	const shiftChangeRequests = JSON.stringify(SCRequests);

    const query2 = 'SELECT ID, empID, startTime, endTime FROM time_off_requests WHERE approvedBySupervisor IS NULL';
    const result2 = await callDatabase(query2);
	
	let TORequests = [];
	if(Array.isArray(result2)) {
		//console.log("Result 2: ", result2);
		TORequests = await Promise.all(
			result2.map(async (request) => {
				const empName = await getEmployeeNameById(request.empID);

				return {
				...request,
				empName,
				};
			})
		);
	}

	//console.log("TO Requests: ", TORequests);
    const timeOffRequests = JSON.stringify(TORequests);
	const idNum = parseInt(id);
    const PSCRequests = SCRequests.filter(
		(request) => {
			//console.log("TradeeId:", request.tradeeEmpID);
			//console.log(typeof request.tradeeEmpID);
			//console.log("acceptedByTradee:", request.acceptedByTradee);
			//console.log(typeof request.acceptedByTradee);
			return request.tradeeEmpID === idNum && request.acceptedByTradee === null
		});
	//console.log(typeof null);
	//console.log(typeof idNum);
	//console.log('--------SCReqeuests: ', SCRequests);
	//console.log('---------------PCRequests: ', PSCRequests);
	const personalShiftChangeRequests = JSON.stringify(PSCRequests);

  	//console.log("--------------Personal SCRs:", personalShiftChangeRequests);
	if(!shiftChangeRequests || shiftChangeRequests.length === 0) {
		return {
			props: {
				shiftChangeRequests: '',
				timeOffRequests,
				personalShiftChangeRequests,
			},
		};
	}
	
	if(!timeOffRequests || timeOffRequests.length === 0) {
		return {
			props: {
				shiftChangeRequests,
				timeOffRequests: '',
				personalShiftChangeRequests,
			},
		};
	}
	if(!personalShiftChangeRequests || personalShiftChangeRequests.length === 0) {
		return {
			props: {
				shiftChangeRequests,
				timeOffRequests,
				personalShiftChangeRequests: '',
			},
		};
	}
	
    return {
      props: {
        shiftChangeRequests,
        timeOffRequests,
		personalShiftChangeRequests,
      },
    };
  } catch (error) {
    console.error('Error fetching info:', error);
	return {
		props: {
			shiftChangeRequests: [],
			timeOffRequests: [],
			personalShiftChangeRequests: [],
		},
	};
  }
}

