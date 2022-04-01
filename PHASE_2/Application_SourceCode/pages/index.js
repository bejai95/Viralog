"use strict";
import Head from "next/head";
import Link from "next/link";
import { useContext, useState, useMemo } from "react";
import NavBar from "../components/NavBar";
import styles from "../styles/Home.module.scss";
import dynamic from 'next/dynamic';
const { URL, URLSearchParams } = require('url');

function formatDate(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

export async function getServerSideProps(context) {
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
  const url = new URL("https://vivid-apogee-344409.ts.r.appspot.com/reports");
  url.search = new URLSearchParams(paramsData).toString();
  const res = await fetch(url);
  const reports = await res.json();

  return {
    props: { reports: reports },
  }
}

export default function Home({ reports }) {
  const [errMsg, setError] = useState();

  const ReportMap = useMemo(() => dynamic(
    () => import('../components/ReportMap'),
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
      <div className={styles.box}>
        <NavBar />
        { errMsg && <div><b style={{color: "red"}}>{errMsg}</b></div> }
        <div className={styles.map}>
          <ReportMap reports={reports}/>
        </div>
      </div>
    </>
  );
}
