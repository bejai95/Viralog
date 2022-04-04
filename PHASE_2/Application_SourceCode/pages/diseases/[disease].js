"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/InfoPage.module.scss";
import DiseaseRiskInfo from "../../components/DiseaseRiskInfo";
import ReportList from "../../components/ReportList";
import { useContext, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import DiseaseImage from "../../public/logo-icon.png";
import Image from "next/image";
import apiurl from "../../utils/apiconn";
import FrequencyGraph from "../../components/FrequencyGraph";

function formatDate(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

export async function getServerSideProps(context) {
  
  const diseaseId = context.params.disease;
  const reqUrl = `${apiurl}/diseases/` + encodeURIComponent(diseaseId);
  const res = await fetch(reqUrl);
  const result = await res.json();
  

  if (result.status && result.status != 200) {
    return { props: { error: result.message } };
  } else if (result.length === 0) {
    return {props: { error: "The disease you are searching for does not exist."}};
  }

  return {
    props: { 
      disease: result
    }
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDiseaseAliases(disease_id, aliases) {
  const filtered = aliases.filter(alias => alias != disease_id);
  if (filtered.length > 0) {
    return <>
      <h2>Also known as</h2>
      <i>{filtered.join(", ")}</i>
    </>;
  }
  return null;
}

export default function DiseaseInfoPage({disease, error}) {
  const ReportMap = useMemo(() => dynamic(
    () => import("../../components/ReportMap"),
    { 
      loading: () => <p>Map is loading...</p>,
      ssr: false
    }
  ), []);

  return (
    <>
      <Head>
        <title>{error ? "Invalid Page" : disease.disease_id + " - Disease Watch"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={"contentMain " + styles.infoPage}>
        {error && 
            <>
              <h1>Error: Invalid Page</h1>
              <p>
                <b>Message from API: </b>
                {error}
              </p>
            </>
          }
          {disease &&
            <>
              <div className={styles.title}>
                <span className={styles.diseaseIcon}><Image src={DiseaseImage} alt="" width={32} height={31} /></span>
                <h1>{capitalizeFirstLetter(disease.disease_id)}</h1>
              </div>
              
              {getDiseaseAliases(disease.disease_id, disease.aliases)}
              
              {disease.symptoms.length > 0 && <h2>Symptoms</h2>}
              <i>{disease.symptoms.join(", ")}</i>
              
              <h2>Risk Analysis</h2>
              <DiseaseRiskInfo disease={disease}/>
              <i style={{ fontSize: "0.8em"}}>* a disease is &quot;high risk&quot; if it has had 10 or more reports in the past 90 days.</i>

              <h2>Report Frequency</h2>
              <FrequencyGraph data={disease.reports_by_week.map((item) => ({x: new Date(item.x), y: item.y}))} diseaseId={disease.disease_id}/>
              <i>Note: The date shown refers to the Monday of that week.</i>

              <h2>Report Map</h2>
              <div className={styles.mapContainer}>
                <ReportMap reports={disease.recent_reports} zoom={2}/>
              </div>

              <h2>Recent Reports</h2>
              <ReportList reports={disease.recent_reports}/>
            </>
          }
      </div>
    </>
  );
}
