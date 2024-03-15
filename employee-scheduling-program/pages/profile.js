// main imports
import Image from 'next/image'
import Link from 'next/link';

// react imports
import { Fragment } from 'react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { callDatabase } from "@/lib/backend/databaseCall";
import { withSessionSsr } from '@/lib/config/withSession';
import axios from 'axios';
// stylesheet imports
import styles from '@/styles/profile.module.css'

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

export default function Profile({ pwdHash, email, phoneNumber, profilePic}) {
  const { query: { role, empName, id } } = useRouter();
  //console.log(role, empName, id);
  //console.log(email, pwdHash, phoneNumber);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    email: email,
    phone: phoneNumber,
    password: pwdHash,
  });
  const handleEditProfile = () => {
    setIsEditMode(true);
  };

  const handleSaveProfile = (updatedProfile) => {
    setProfileData(updatedProfile);
    setIsEditMode(false);
  };
  console.log("profile pic before render:", profilePic);
  return (
    <Fragment>
      <NavBar role={role} empName={empName} id={id} />
      {isEditMode ? (
            <ProfileEdit profileData={profileData} onSaveProfile={handleSaveProfile} iden={id} role={role} empName={empName} profilePic={profilePic}/>
          ) : (
            <ProfileView profileData={profileData} onEditProfile={handleEditProfile} iden={id} role={role} empName={empName} profilePic={profilePic} />
          )}
    </Fragment>
  );
}

const ProfileView = ({ profileData, onEditProfile, iden, role, empName, profilePic }) => {
  console.log("profile pic in ProfileView", profilePic);
  return (
    <div className={styles.mainProfileContainer}>
      <div className={styles.profilecontainer}>
        <div className={styles.buttonContainer}>
          <button className={styles.editButton} onClick={onEditProfile}>
              Edit Profile
          </button>
        </div>
        <div className={styles.profileimage}>
          <img src={profilePic} alt="Profile Picture" />
        </div>
        <h1 className={styles.profilename}>{empName}</h1>
        <div className={styles.profileinfo}>
          <p>Id: {iden}</p>
          <p>Role: {role}</p>
          <p>Email: {profileData.email}</p>
          <p>Phone: {profileData.phone}</p>
          <p>Password: {profileData.password}</p>
        </div>
        <div className={styles.buttonContainer}>
          {/* This div will reserve space for the Save Profile button in Edit Profile mode */}
          <button className={styles.editButton} style={{ visibility: 'hidden' }}>
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfileEdit = ( { profileData, onSaveProfile, role, empName, iden, profilePic }) => {
  const [email, setEmail] = useState(profileData.email);
  const [phone, setPhone] = useState(profileData.phone);
  const [password, setPassword] = useState(profileData.password);
  const [failedEmail, setFailedEmail] = useState(false);
  const [failedPhone, setFailedPhone] = useState(false);
  const [failedPassword, setFailedPassword] = useState(false);

  const handleSave = async () => {
    const updatedProfile = {
      email,
      phone,
      password,
      id: iden,
    };
    setFailedEmail(false);
    setFailedPhone(false);
    setFailedPassword(false);
    if(isValidEmail(email)){
      setFailedEmail(false);
    }
    if(isValidPhoneNumber(phone)){
      setFailedPhone(false);
    }
    if(isValidPassword(password)){
      setFailedPassword(false);
    }
    if (!isValidEmail(email)) {
      setFailedEmail(true);
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setFailedPhone(true);
      return;
    }

    if (!isValidPassword(password)){
      setFailedPassword(true);
      return;
    }

    try {
      await axios.post('/api/updateProfile', updatedProfile);
      onSaveProfile(updatedProfile); 
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  return (
    <div className={styles.mainProfileContainer}>
      <div className={styles.profilecontainer}>
        <div className={styles.buttonContainer}>
          <button className={styles.editButton} style={{ visibility: 'hidden' }}>
            Edit Profile
          </button>
        </div>
        <div className={styles.profileimage}>
          <img src={profilePic} alt="Profile Picture" />
        </div>
        <h1 className={styles.profilename}>{empName}</h1>
        <div className={styles.profileinfo}>
          <p>Id: {iden}</p>
          <p>Role: {role}</p>
          <div className={styles.inputContainer}>
            <label htmlFor="email">Email:</label>
            <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="phone">Phone:</label>
            <input id="phone" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className={styles.inputContainer}>
            <label htmlFor="password">Password:</label>
            <input id="password" type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <button className={styles.editButton} onClick={handleSave}>
                Save Profile
          </button>
        </div>
        <div>
          {failedEmail && ( 
            <label className={styles.failText}>Invalid email format</label>
          )}
          {failedPhone && (
            <label className={styles.failText}>Invalid phone number format</label>
          )}
          {failedPassword && (
            <label className={styles.failText}>Invalid pass word</label>
          )}
        </div>
      </div>
    </div>
  );
};


// Function to check if the email format is valid
const isValidEmail = (email) => {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
};

// Function to check if the phone number format is valid
const isValidPhoneNumber = (phoneNumber) => {
  const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
  return phoneRegex.test(phoneNumber);
};

const isValidPassword = (password) => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,}$/;
  return passwordRegex.test(password);
};

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
    const { params, query } = context;
    const id = params?.id || query?.id;
    //console.log("ID NUMBER:", id);
    const query2 = 'SELECT pwdHash, email, phoneNumber, profilePic FROM employees WHERE ID = ?';
    const result = await callDatabase(query2, [id]);

    if (result.length === 0) {
      // Handle the case when no entry is found for the provided ID
      return {
        notFound: true,
      };
    }

    const { pwdHash, email, phoneNumber, profilePic } = result[0]; // Retrieve the specific variables from the first entry
  
    const queryMaxId = 'SELECT MAX(ID) as maxId FROM employees';
    const resultMaxId = await callDatabase(queryMaxId);

    let maxId = 0;
    if (resultMaxId.length > 0 && resultMaxId[0].maxId !== null) {
      maxId = resultMaxId[0].maxId;
    }

    const newId = maxId + 1;
    return {
      props: {
        id,
        pwdHash,
        email,
        phoneNumber,
        profilePic,
      },
    };
  } catch (error) {
    console.error('Error fetching info:', error);
    return {
      props: {
        id: null,
        pwdHash: null,
        email: null,
        phoneNumber: null,
        profilePic: null,
      },
    };
  }
}
