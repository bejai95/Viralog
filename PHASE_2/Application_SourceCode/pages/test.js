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
import HighRiskDiseasesGraph from "../components/HighRiskDiseasesGraph"

async function getDiseases() {
  const url = new URL(`${apiurl}/diseases`);
  const res = await fetch(url);
  const diseases = await res.json();
  return diseases;
}

export async function getServerSideProps(context) {
  return {
    props: {
      diseases: await getDiseases()
    }
  };
}

export default function Test( { diseases } ) {
  
  // Sort by recent report count instead of total report count
  diseases.sort(function(a,b) {
    return b.recent_report_count - a.recent_report_count;
  })

  // Take the top 7 results and get their names and recent report counts
  let xValues = [];
  let yValues = [];
  const diseasesToGraph = diseases.slice(0,7);
  diseasesToGraph.forEach(function (item, index) {
    xValues[index] = item.disease_id;
    yValues[index] = item.recent_report_count;
  })

  return (
    <>
      <Head>
        <title>Test</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HighRiskDiseasesGraph xValues={xValues} yValues={yValues} />
    </>
  )
}