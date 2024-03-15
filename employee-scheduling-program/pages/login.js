import React, { useState } from 'react';
import styles from "@/styles/login.module.css"
import { callDatabase } from "@/lib/backend/databaseCall";
import { useRouter } from 'next/router';

const Login = ({ ids, firstNames, lastNames }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [failedLogin, setFailedLogin] = useState(false);
    const [selectedManager, setManager] = useState('Employee');
    const [empName, setName] = useState('');
    const router = useRouter();
    const handleSubmit =  async (e) => {
        e.preventDefault();
        const foundIndex = ids.findIndex(
          (dbUsername) => dbUsername.toString() === username
        );
        const updatedFirstName = firstNames[foundIndex];
        const updatedLastName = lastNames[foundIndex];
        const updatedName = `${updatedFirstName} ${updatedLastName}`;
        const response = await fetch("/api/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password, role: selectedManager, empName: updatedName})
        });
        
        //console.log("Passwords and usernames from database: ",usernames, passwords);
        if (response.ok) {
          setName(updatedName);
          setUsername('');
          setPassword('');
          router.push('/');
        }
        //console.log(ids[foundIndex], passwords[foundIndex], roles[foundIndex]);
        else{
          console.log("failure");
            setPassword(''); //resets password field
            setFailedLogin(true);
        }
    };

    const handleEmpClick = (e) => {
      if (selectedManager === 'Manager'){
        setUsername('');
        setPassword('');
        setManager('Employee');
      }
    }

    const handleManClick = (e) => {
      if (selectedManager === 'Employee'){
        setUsername('');
        setPassword('');
        setManager('Manager');
      }
    }

    function LoginEmpButton() {
      return (
        <button className={selectedManager === 'Employee' ? styles.whiteButton : styles.greyButton} onClick={handleEmpClick}>Employee Login</button>
      )
    }
    function LoginManButton() {
      return (
        <button className={selectedManager === 'Manager' ? styles.whiteButton : styles.greyButton} onClick={handleManClick}>Manager Login</button>
      )
    }

    return (
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.selectLogin}>
            <LoginEmpButton />
            <LoginManButton />
          </div>
          <div className={styles.loginBox}>
            <h1 className={styles.signInText}>Sign in</h1>
            <form onSubmit={handleSubmit}>
              {selectedManager === 'Employee' ? 
                <label htmlFor="username">Employee Username:</label> : <label htmlFor="username">Manager Username:</label>
              }
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
              />
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
              {failedLogin && (
                <label className={styles.failText}>Invalid username or password</label>
              )}
              <button onClick={handleSubmit} className={styles.button}>LOG IN</button>
            </form>
          </div>
        </div>
      <div className={styles.rightPanel}> 
        <div className={styles.rightPanelContent}>
          <h1 className={styles.rightPanelHeader2}>ColdSchedules</h1>
          <h1 className={styles.rightPanelHeader}>Streamline the scheduling process.</h1>
          <h2 className={styles.rightPanelText}>Managers</h2>
          <h4 className={styles.rightPanelText}>Organize your workforce.</h4>
          <h2 className={styles.rightPanelText}>Employees</h2>
          <h4 className={styles.rightPanelText}>Voice your availability.</h4>
          <h2 className={styles.rightPanelText}>Companies</h2>
          <h4 className={styles.rightPanelText}>Achieve employee satisfaction and engagement.</h4>
        </div>
      </div>
    </div>
  );
};
export default Login;


export async function getServerSideProps() {
  try {
    const query = 'SELECT ID, pwdHash, isSupervisor, firstName, lastName FROM employees';
    const result = await callDatabase(query);
    const ids = result.map(entry => entry.ID);
    const firstNames = result.map(entry => entry.firstName);
    const lastNames = result.map(entry => entry.lastName);
    return {
      props: {
        ids,
        firstNames,
        lastNames,
      },
    };
  } catch (error) {
    console.error('Error fetching info:', error);
    return {
      props: {
        ids: [],
        firstNames: [],
        lastNames: [],
      },
    };
  }
}
