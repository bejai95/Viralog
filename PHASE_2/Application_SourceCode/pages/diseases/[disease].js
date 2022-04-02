"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Disease.module.scss";
function formatDate(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

export async function getServerSideProps(context) {
  const diseaseName = context.params.disease;
  
  // First query disease information
  const reqUrl = "https://vivid-apogee-344409.ts.r.appspot.com/diseases/" + encodeURIComponent(diseaseName);

  const diseaseResult = await fetch(reqUrl);
  const diseaseInfo = await diseaseResult.json();

  if (diseaseResult.status && diseaseResult.status != 200) {
    return { props: { error: diseaseResult.message } };
  } else if (diseaseResult.length === 0) {
    return {props: { error: "The disease you are searching for does not exist."}}
  }

  // Now query how many reports there have been of the disease in the past 90 days
  let currDate1 = new Date();
  const periodEnd1 = formatDate(currDate1);
  currDate1.setDate(currDate1.getDate() - 90);
  const periodStart1 = formatDate(currDate1);
  const paramsData2 = {
    period_of_interest_start: periodStart1,
    period_of_interest_end: periodEnd1,
    key_terms: diseaseName,
    location: "",
  };
  const url2 = new URL("https://vivid-apogee-344409.ts.r.appspot.com/reports");
  url2.search = new URLSearchParams(paramsData2).toString();
  const res2 = await fetch(url2);
  const result2 = await res2.json();

  // Now query how many reports there have been of the disease in total (no time restriction)
  let currDate2 = new Date();
  const periodEnd2 = formatDate(currDate2);
  currDate2.setFullYear(currDate2.getFullYear() - 500);
  const periodStart2 = formatDate(currDate2);
  const paramsData3 = {
    period_of_interest_start: periodStart2,
    period_of_interest_end: periodEnd2,
    key_terms: diseaseName,
    location: "",
  };
  const url3 = new URL("https://vivid-apogee-344409.ts.r.appspot.com/reports");
  url3.search = new URLSearchParams(paramsData3).toString();
  const res3 = await fetch(url3);
  const result3 = await res3.json();

  return {
    props: { 
      disease: diseaseInfo, 
      numReports1: result2.length,
      numReports2: result3.length,
    } 
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function determineRisk(numReports) {
  if (numReports < 10) {
    return "low risk";
  } else {
    return "high risk";
  }
}

function getDiseaseAliases(disease_id, aliases) {
  const filtered = aliases.filter(alias => alias != disease_id);
  if (filtered.length > 0) {
    // return <i>(also known as {filtered.join(", ")})</i>
    return <>
      <h3>Also known as...</h3>
        <ul>
          {filtered.map(name => (
            <li key={name}>{name}</li>
          ))}
        </ul>
    </>
  }
  return null;
}

export default function DiseaseInfoPage(props) {
  
  return (
    <>
      <Head>
        <title>{props.error ? "Invalid Page" : props.disease.disease_id}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="contentMain">
        {props.error && 
            <>
              <h1>Error: Invalid Page</h1>
              <p>
                <b>Message from API: </b>
                {props.error}
              </p>
            </>
          }
          {props.disease &&
            <>
              <h1>{capitalizeFirstLetter(props.disease.disease_id)}</h1>
              
              {getDiseaseAliases(props.disease.disease_id, props.disease.aliases)}
              
              <h3>Symptoms</h3>
              <ul>
                {props.disease.symptoms.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <br></br>
              <h2>Risk Analysis</h2>
              <p>There have been {props.numReports1} reports of {props.disease.disease_id} in the past 90 days, and {props.numReports2} reports in total.</p>
              <p>Based on the number of reports in the past 90 days, there is currently a <b>{determineRisk(props.numReports2)}</b> of {props.disease.disease_id}.</p>
              
              <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
              <h3>Visualisation of case/report frequency around the world</h3>
              <br></br>
              <h3>Predictions (if they exist)</h3>
            </>
          }
      </div>
    </>
  );
}
