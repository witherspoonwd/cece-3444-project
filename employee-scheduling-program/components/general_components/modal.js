// import styles from modal
import styles from "/styles/modal.module.css";

export function Modal(props){
  const handleClick = (event) => {
    // Check if the clicked element or its parent is the modalBody
    if (
      event.target === event.currentTarget ||
      event.target.parentElement === event.currentTarget
    ) {
      // Perform desired action here
      props.toggleFunction();
    }
  };

  return (
    <div className={styles.modalBody} onClick={handleClick}>
      <div className={styles.modalContainer}>
          {props.children}
      </div>
    </div>
  )
}