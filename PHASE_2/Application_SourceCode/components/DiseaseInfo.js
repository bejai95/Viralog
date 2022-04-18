"use strict";
import styles from "../styles/DiseaseInfo.module.scss";
import Link from "next/link";
import DiseaseRiskInfo from "../components/DiseaseRiskInfo";
import FrequencyGraph from "../components/FrequencyGraph";

function DiseaseInfo({disease, simplified = false}) {
  return (
  <li key={disease.disease_id} className={styles.listItem}>
      <Link href={"/diseases/" + encodeURIComponent(disease.disease_id)}>
      <a className={styles.diseaseLink}>{disease.disease_id}</a>
      </Link>
      {!simplified && <DiseaseRiskInfo disease={disease} flexStyle={{justifyContent: "center"}}/>}
      <FrequencyGraph data={disease.reports_by_week ?
      disease.reports_by_week.map((item) => ({x: new Date(item.x), y: item.y}))
      : []
      }
      diseaseId={disease.disease_id}
      />
  </li>
  );
}

export default DiseaseInfo;
