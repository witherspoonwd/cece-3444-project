import styles from "/styles/panel.module.css"

export function Panel(props){

  let panelClass, bodyClass = styles.panelBody;

  // check for full width class
  if (props.fullWidth == true){
    panelClass = `${styles.panel} ${styles.fullWidth}`
  } else {
    panelClass = styles.panel;
  }

  // check for add/replace panel class
  if (props.addClass){
    panelClass = panelClass + ` ${props.addClass}`;
  } else if (props.replaceClass) {
    panelClass = props.replaceClass;
  }

  // check for hoverable panel
  if (props.hoverablePanel === true){
    panelClass = panelClass + ` ${styles.hoverablePanel}`;
  }

  if (props.noPadding === true){
    panelClass = panelClass + ` ${styles.panelNoPadding}`;
  }

  // check for add/replace body class
  if (props.addBodyClass){
    bodyClass = bodyClass + ` ${props.addBodyClass}`
  } else if (props.replaceBodyClass){
    bodyClass = props.replaceBodyClass;
  }

  return (
  <div className={panelClass}>
    {props.header && <div className={styles.panelHeader}>
      {props.header}
    </div>}

    <div className={bodyClass}>
      {props.children}
    </div>
  </div>
  )
}