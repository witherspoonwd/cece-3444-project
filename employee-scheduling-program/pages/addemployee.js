// main imports
import Image from 'next/image'
import Link from 'next/link';

// react imports
import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { withSessionSsr } from '@/lib/config/withSession';
import axios from 'axios';
import { callDatabase } from "@/lib/backend/databaseCall";

// stylesheet imports
import styles from '@/styles/addemployee.module.css'

// component import
import NavBar from "@/components/navbar.js";


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


export default function AddEmployee({ newId }){
    const { query: { role, empName, id } } = useRouter();

    return (
        <Fragment>
            <NavBar role={role} empName={empName} id={id} />
            <AddEmployeePanel newId={newId} />
        </Fragment>
    )
}


const AddEmployeePanel = ({ newId }) => {
    const [isSupervisor, setSupervisor] = useState('FALSE');
    const [firstName, setFirst] = useState('');
    const [lastName, setLast] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPass] = useState('');
    const [submittedUser, setSubmittedUser] = useState(false);
    const [failedFirst, setFailedFirst] = useState(false);
    const [failedLast, setFailedLast] = useState(false);
    const [failedEmail, setFailedEmail] = useState(false);
    const [failedPhone, setFailedPhone] = useState(false);
    const [failedPassword, setFailedPassword] = useState(false);
    const [shownNewId, setNewId] = useState(newId);
    const newUser = {
        firstName,
        lastName,
        email,
        phone,
        password,
        isSupervisor,
    }
    const handleRoleSelector = (role) =>{
        setSupervisor(role);
    };

    const handleSubmit = async () => {
        setFailedFirst(false);
        setFailedLast(false);
        setFailedPassword(false);
        setFailedEmail(false);
        setFailedPhone(false);
        
        if(isValidEmail(email)){
          setFailedEmail(false);
        }
        if(isValidPhoneNumber(phone)){
          setFailedPhone(false);
        }
        if(isValidName(firstName)){
            setFailedFirst(false);
        }
        if(isValidName(lastName)){
            setFailedLast(false);
        }
        if(isValidPassword(password)){
            setFailedPassword(false);
        }

        if (!isValidName(firstName)){
            setFailedFirst(true);
            return;
        }
        if (!isValidName(lastName)){
            setFailedLast(true);
            return;
        }
        if (!isValidEmail(email)){
            setFailedEmail(true);
            return;
        }
        if (!isValidPhoneNumber(phone)){
            setFailedPhone(true);
            return;
        }
        if (!isValidPassword(password)){
            setFailedPassword(true);
            return;
        }

        try {
            await axios.post('/api/newUser', newUser);
            setSubmittedUser(true);
          } catch (error) {
            console.error('Error updating profile:', error);
          }
    }

    const handleAnotherUser = () => {
        setFirst('');
        setLast('');
        setEmail('');
        setPhone('');
        setPass('');
        setSupervisor('FALSE')
        setSubmittedUser(false);
        setNewId(shownNewId + 1);
    }
    return (
        <div className={styles.mainAddContainer}>
            {submittedUser === false ? (
                <div className={styles.addContainer}>
                    <h1>Add New Employee</h1>
                    <div className={styles.rowContainer}>
                        <div>
                        New Employee ID: <b>{shownNewId}</b>
                        </div>
                    </div>
                    <div className={styles.rowContainer}>
                        <div className={styles.leftContainer}>
                            First Name: 
                            <input className={styles.inputBox} value={firstName} onChange={(e) => setFirst(e.target.value)}></input>
                        </div>
                        <div className={styles.rightContainer}>
                            Last Name:
                            <input className={styles.inputBox} value={lastName} onChange={(e) => setLast(e.target.value)}></input>
                        </div>
                    </div>
                    <div className={styles.rowContainer}>
                        <div className={styles.leftContainer}>
                            Email: 
                            <input className={styles.inputBox} value={email} onChange={(e) => setEmail(e.target.value)}></input>
                        </div>
                        <div className={styles.rightContainer}>
                            Phone:
                            <input className={styles.inputBox} value={phone} onChange={(e) => setPhone(e.target.value)}></input>
                        </div>
                    </div>
                    <div className={styles.rowContainer}>
                        <div className={styles.leftContainer}>
                            Password: 
                            <input className={styles.inputBox} value={password} onChange={(e) => setPass(e.target.value)}></input>
                        </div>
                        <div className={styles.rightContainer}>
                            Role:
                            <div className={styles.buttonsContainer}>
                                <button className={isSupervisor === 'TRUE' ? styles.selectedButton : styles.button} onClick={() => handleRoleSelector('TRUE')}>
                                    Manager
                                </button>
                                <button className={isSupervisor === 'FALSE' ? styles.selectedButton : styles.button} onClick={() => handleRoleSelector('FALSE')}>
                                    Employee
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        {failedFirst && ( 
                            <label className={styles.failText}>Invalid first name format</label>
                        )}
                        {failedLast && ( 
                            <label className={styles.failText}>Invalid last name format</label>
                        )}
                        {failedEmail && ( 
                            <label className={styles.failText}>Invalid email format</label>
                        )}
                        {failedPhone && (
                            <label className={styles.failText}>Invalid phone number format</label>
                        )}
                        {failedPassword && ( 
                            <label className={styles.failText}>Invalid password format (8+ characters, alphas and digits, atleast 1 upper 1 lower 1 digit)</label>
                        )}
                    </div>
                    <button className={styles.submitButton} onClick={handleSubmit}>Submit</button>
                </div>
                ) : (
                    <div className={styles.submittedContainer}>
                        <h3>You have successfully added a new user into the database. The user can login on their device.</h3>
                        <button onClick={handleAnotherUser}>Add Another User</button>
                    </div>
                )}
        </div>
    )
}

const isValidEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return emailRegex.test(email);
};
  
const isValidPhoneNumber = (phoneNumber) => {
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    return phoneRegex.test(phoneNumber);
};

const isValidName = (name) => {
    const nameRegex = /^[A-Za-z'-]+$/;
    return nameRegex.test(name);
};

const isValidPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/;
    return passwordRegex.test(password);
};


export async function getServerSideProps(context){
    try{
    const user = await IronSessionCheck(context);
    const queryMaxId = 'SELECT MAX(ID) as maxId FROM employees';
    const resultMaxId = await callDatabase(queryMaxId);

    let maxId = 0;
    if (resultMaxId.length > 0 && resultMaxId[0].maxId !== null) {
      maxId = resultMaxId[0].maxId;
    }

    const newId = maxId + 1;
    return {
        props: {
          newId,
        },
      };
    } catch (error) {
      console.error('Error fetching info:', error);
      return {
        props: {
          newId: null,
        },
      };
    }
  }