"use strict";
import styles from "../styles/ReportHelp.module.scss";
import { MdInfoOutline } from "react-icons/md";
import { IconContext } from "react-icons";

function ReportHelp() {
  return (
  <div className={styles.reportHelp}>
      <IconContext.Provider value={{size: "1.5em"}}><MdInfoOutline /></IconContext.Provider>
      <span>the following articles were found which document diseases in this location</span>
  </div>
  );
}

export default ReportHelp;
