"use strict";
import styles from "../styles/DiseaseRiskInfo.module.scss";

function determineRisk(numReports) {
	if (numReports < 10) {
	  return "low";
	} else {
	  return "high";
	}
}

function DiseaseRiskInfo({disease, flexStyle}) {
  return (
    <div className={styles.riskInfo} style={flexStyle}>
      <span>
        <b>{disease.recent_report_count}</b>
        <i>reports in the past 90 days</i>
      </span>

      <span>
        <b>{disease.total_report_count}</b>
        <i>reports total</i>
      </span>

      <span className={styles.riskRating}>
        <b>{determineRisk(disease.recent_report_count)} risk</b>
        <i>based on recent report count*</i>
      </span>
    </div>
  );
}

export default DiseaseRiskInfo;
