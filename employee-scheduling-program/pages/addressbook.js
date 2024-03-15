import React, { Fragment } from 'react';
import NavBar from "@/components/navbar.js";
import { callDatabase } from "@/lib/backend/databaseCall";
import { useRouter } from 'next/router';
import styles from '@/styles/addressbook.module.css';
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

export default function AddressBook({ employees }) {
  const supervisors = employees.filter((employee) => employee.isSupervisor);
  const nonSupervisors = employees.filter((employee) => !employee.isSupervisor);
  const { query: { role, empName, id } } = useRouter();
  return (
    <Fragment>
      <NavBar role={role} empName={empName} id={id}/>
      <div className={styles.container}>
        <h4 className={styles.subHeaderTitle}>Supervisors</h4>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.cell}>Name</th>
              <th className={styles.cell}>Email</th>
              <th className={styles.cell}>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {supervisors.map((employee, index) => (
              <tr key={index} className={styles.row}>
                <td className={styles.cell}>{`${employee.firstName} ${employee.lastName}`}</td>
                <td className={styles.cell}>{employee.email}</td>
                <td className={styles.cell}>{employee.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
		
        <h4 className={styles.subHeaderTitle}>Non-Supervisors</h4>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.cell}>Name</th>
              <th className={styles.cell}>Email</th>
              <th className={styles.cell}>Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {nonSupervisors.map((employee, index) => (
              <tr key={index} className={styles.row}>
                <td className={styles.cell}>{`${employee.firstName} ${employee.lastName}`}</td>
                <td className={styles.cell}>{employee.email}</td>
                <td className={styles.cell}>{employee.phoneNumber}</td>           
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Fragment>
  );
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
  
    let userData = {};
  
    if (user && user.props && user.props.user) {
      userData = {
        username: user.props.user.username,
        role: user.props.user.role,
        empName: user.props.user.empName,
      };
    }
		const query = 'SELECT firstName, lastName, email, phoneNumber, isSupervisor FROM employees';
		const result = await callDatabase(query);
		console.log('Result:', result);
		
		const sortedEmployees = result.sort((a, b) => {			
			if (a.isSupervisor && !b.isSupervisor) {
				return -1;
			} else if (!a.isSupervisor && b.isSupervisor) {
				return 1;
			} else {
				return a.lastName.localeCompare(b.lastName);
			}
		});
			
		return {
			props: {
				employees: sortedEmployees,
			},
		};
	} catch (error) {
		console.error('Error fetching info:', error);
		return {
			props: {
				employees: [],
			},
		};
	}
}
