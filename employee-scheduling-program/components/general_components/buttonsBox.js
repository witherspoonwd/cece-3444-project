import styles from "@/styles/buttons.module.css";

function Button(props){

  return (
    <div onClick={props.onClick} className={styles.button}>
      {props.text}
    </div>
  )
}

export function ButtonBox(props){
  return (
    <div className={styles.buttonBox}>
      {
        Object.keys(props.buttons).map((prop) => (
          <Button key={prop} asc={prop} onClick={props.buttons[prop].func} text={props.buttons[prop].text} />
        ))
      }
    </div>
  );
}