"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/InfoPage.module.scss";
import DiseaseRiskInfo from "../../components/DiseaseRiskInfo";
import ReportList from "../../components/ReportList";
import { useContext, useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import DiseaseImage from "../../public/disease-icon.png";
import Image from "next/image";
import apiurl from "../../utils/apiconn";
import FrequencyGraph from "../../components/FrequencyGraph";
import { getCookie, setCookies } from "cookies-next";
import {inList, removeFromList } from "../../utils/lists";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faMinus } from "@fortawesome/free-solid-svg-icons";
import { MdInfoOutline } from "react-icons/md";
import { IconContext } from "react-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [watched, setWatched] = useState(false);

  const ReportMap = useMemo(() => dynamic(
    () => import("../../components/ReportMap"),
    { 
      loading: () => <p>Map is loading...</p>,
      ssr: false
    }
  ), []);

  useEffect(async () => {
    // Initialise watched value
    let cookie = await JSON.parse(getCookie("watched"))
    setWatched(inList(cookie, disease.disease_id))
  }, [])

  const toggleWatch = async (disease_id) => {
    let cookie = await JSON.parse(getCookie("watched"))
    if (inList(cookie, disease_id)) {
      toast.info(`Removed ${disease_id} from dashboard.`)
      setCookies("watched", removeFromList(cookie, disease_id))
    } else {
      toast.info(`Added ${disease_id} to dashboard!`)
      setCookies("watched", [...cookie, disease_id])
    }
    setWatched(!watched)
  }

  return (
    <>
      <Head>
        <title>{error ? "Invalid Page" : disease.disease_id + " - Viralog"}</title>
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
              <ToastContainer autoClose={2000}/>
              <div className={styles.title}>
                <div className={styles.leftTitle}>
                  <span className={styles.diseaseIcon}><Image src={DiseaseImage} alt="" width={32} height={31} /></span>
                  <h1>{capitalizeFirstLetter(disease.disease_id)}</h1>
                </div>
                <div className={styles.rightTitle}>
                  <button className={watched ? styles.activeWatch : styles.inactiveWatch} onClick={() => toggleWatch(disease.disease_id)}>
                    {watched ? "Unwatch" : "Watch"} disease
                    &nbsp; 
                    <FontAwesomeIcon icon={watched ? faMinus : faPlus} size="lg"/>
                  </button>
                </div>
              </div>
              
              {getDiseaseAliases(disease.disease_id, disease.aliases)}
              
              {disease.symptoms.length > 0 && <h2>Symptoms</h2>}
              <i>{disease.symptoms.join(", ")}</i>
              
              <h2>Risk Analysis</h2>
              <DiseaseRiskInfo disease={disease}/>
              <i className={styles.hint}>
                * a disease is &quot;high risk&quot; if it has had 10 or more reports in the past 90 days.
              </i>

              <h2>Report Frequency</h2>
              <div className={styles.hint}>
                <IconContext.Provider value={{size: "1.4em"}}><MdInfoOutline /></IconContext.Provider>
                <span>these reports relating to {disease.disease_id} were found on news articles around the world.</span>
              </div>
              <FrequencyGraph  diseaseId={disease.disease_id}/>
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
