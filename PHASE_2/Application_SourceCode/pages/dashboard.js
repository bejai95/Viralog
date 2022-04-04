"use strict";
import Head from "next/head";
import Link from "next/link";
import { useContext, useState, useMemo } from "react";
import NavBar from "../components/NavBar";
import styles from "../styles/Dashboard.module.scss";
import dynamic from "next/dynamic";
import apiurl from "../utils/apiconn";
import DiseaseRiskInfo from "../components/DiseaseRiskInfo";
import FrequencyGraph from "../components/FrequencyGraph";
import DiseaseInfo from "../components/DiseaseInfo";

function formatDate(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

async function getReports() {
  // Get past 90 days.
  let currDate = new Date();
  const periodEnd = formatDate(currDate);
  currDate.setDate(currDate.getDate() - 90);
  const periodStart = formatDate(currDate);

  const paramsData = {
  period_of_interest_start: periodStart,
  period_of_interest_end: periodEnd,
  key_terms: "",
  location: "",
  };
  const url = new URL(`${apiurl}/reports`);
  url.search = new URLSearchParams(paramsData).toString();
  const res = await fetch(url);
  return await res.json();
}

async function getDiseases() {
  const url = new URL(`${apiurl}/diseases`);
  const res = await fetch(url);
  const diseases = await res.json();
  return diseases;
}

export async function getServerSideProps(context) {
  return {
  props: {
    reports: await getReports(),
    diseases: await getDiseases()
  },
  };
}

export default function Home({ reports, diseases }) {
  const [errMsg, setError] = useState();

  const ReportMap = useMemo(() => dynamic(
  () => import("../components/ReportMap"),
  { 
    loading: () => <p>Map is loading...</p>,
    ssr: false
  }
  ), []);

  return (
  <>
    <Head>
    <title>Disease Watch</title>
    <link rel="icon" href="/favicon.ico" />
    </Head>
    <NavBar />
    <div className={styles.contentMain}>
    <h1 className={styles.mainHeading}>Dashboard</h1>
    { errMsg && <div><b style={{color: "red"}}>{errMsg}</b></div> }
    <h2 className={styles.mainHeading}>Watched Diseases</h2>
    <i>{"(User disease 'watching' is yet to be implemented)"}</i>
    <ul className={styles.activeList}>
      { diseases.slice(0, 2).map(disease => <DiseaseInfo key={disease.disease_id} disease={disease}/>) }
    </ul>
    <h2 className={styles.mainHeading}>Active Diseases</h2>
    <ul className={styles.activeList}>
      { diseases.slice(0, 10).map(disease => <DiseaseInfo key={disease.disease_id} disease={disease}/>) }
    </ul>

    </div>
  </>
  );
}
