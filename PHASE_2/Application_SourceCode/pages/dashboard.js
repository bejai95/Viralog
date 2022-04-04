"use strict";
import Head from "next/head";
import Link from "next/link";
import { useContext, useState, useMemo } from "react";
import NavBar from "../components/NavBar";
import styles from "../styles/Dashboard.module.scss";
import dynamic from "next/dynamic";
import apiurl from "../utils/apiconn";
const { URL, URLSearchParams } = require("url");

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
        <h1>Dashboard</h1>
        { errMsg && <div><b style={{color: "red"}}>{errMsg}</b></div> }
        <h2>Interactive Report Map</h2>
        <i>Showing past 90 days...</i>
        <div className={styles.mapContainer}>
          <ReportMap reports={reports} zoom={2}/>
        </div>
        <h2>Active Diseases</h2>
        <ul>
        {
          diseases.slice(0, 10).map(disease => 
            <li key={disease.disease_id}>
              <Link href={"/diseases/" + encodeURIComponent(disease.disease_id)}>
                <a>{disease.disease_id}</a>
              </Link>
            </li>
          )
        }
        </ul>

      </div>
    </>
  );
}
