import Link from 'next/link';
import styles from "@/styles/NavBar.module.css";
import { useRouter } from 'next/router';

export default function NavBar({ role, empName, id }) {
  const router = useRouter();
  const profilePic = generateProfilePicFilename(empName);
  const handleLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
/* 
  var Cookies = document.cookie.split(';');
 // set past expiry to all cookies
  for (var i = 0; i < Cookies.length; i++) {
   document.cookie = Cookies[i] + "=; expires="+ new Date(0).toUTCString();
  } */

    window.location.replace("/login");
  };

  return (
    <div className={styles.navBarContainer}>
      <div className={styles.navBarButtonBox}>
        <Link href="/" className={styles.navBarButton}>
          <div className={styles.navBarButtonChild}>
            Home
          </div>
        </Link>

        <Link href={"/calendar?role=" + role + "&empName=" + empName + "&id=" + id} className={styles.navBarButton}>
          <div className={styles.navBarButtonChild}>
            Schedule
          </div>
        </Link>

        <Link href={"/availability?role=" + role + "&empName=" + empName + "&id=" + id} className={styles.navBarButton}>
          <div className={styles.navBarButtonChild}>
              Availability
          </div>
        </Link>

        <Link href={"/addressbook?role=" + role + "&empName=" + empName + "&id=" + id} className={styles.navBarButton}>
          <div className={styles.navBarButtonChild}>
              Address Book
          </div>
        </Link>
        {role == 'Manager' && (
          <Link href={"/addemployee?role=" + role + "&empName=" + empName + "&id=" + id} className={styles.navBarButton}>
            <div className={styles.navBarButtonChild}>
               Add Employee
            </div>
          </Link>)
        }
        <Link href={"/approval?role=" + role + "&empName=" + empName + "&id=" + id} className={styles.navBarButton}>
            <div className={styles.navBarButtonChild}>
               Approval
            </div>
        </Link>

      </div>

      <div className={styles.navBarButtonBox}>
      <Link href={"/profile?role=" + role + "&empName=" + empName + "&id=" + id} className={styles.navBarButton}>
        <div className={styles.navBarButtonChild}>
          <div className={styles.circularImageWrapper}>
            <img src={profilePic}/>
          </div>
          <div className={styles.navBarText}>
            {empName}
          </div>
        </div>
      </Link>
      <Link href="#" className={styles.navBarButton} onClick={handleLogout}>
        <div className={styles.navBarButtonChild} >
            Logout
        </div>
      </Link>
      </div>
    </div>
  )
}

function generateProfilePicFilename(empName) {
  // Convert empName to lowercase
  const name = empName || 'default';
  const lowercaseName = name.toLowerCase();

  // Remove spaces and dots using regular expressions
  const filename = lowercaseName.replace(/[\s.]/g, '');

  // Add .png at the end
  const profilePicFilename = filename + '.png';

  return profilePicFilename;
}