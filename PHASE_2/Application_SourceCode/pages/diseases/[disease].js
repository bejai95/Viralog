"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/InfoPage.module.scss";
function formatDate(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

export async function getServerSideProps(context) {
  const diseaseId = context.params.disease;
  const diseaseInfo = await getDiseaseInfo(diseaseId);

  return {
    props: { 
      disease: diseaseInfo
    } 
  };
}

async function getDiseaseInfo(diseaseId) {
  const reqUrl = "https://vivid-apogee-344409.ts.r.appspot.com/diseases/" + encodeURIComponent(diseaseId);

  const res = await fetch(reqUrl);
  const diseaseInfo = await res.json();

  return diseaseInfo;
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
    </>;
  }
  return null;
}

export default function DiseaseInfoPage({disease, error}) {
  
  return (
    <>
      <Head>
        <title>{error ? "Invalid Page" : disease.disease_id + " - Disease Watch"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="contentMain">
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
              <h1>{capitalizeFirstLetter(disease.disease_id)}</h1>
              
              {getDiseaseAliases(disease.disease_id, disease.aliases)}
              
              <h3>Symptoms</h3>
              <ul>
                {disease.symptoms.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              <br></br>
              <h2>Risk Analysis</h2>
              <p>There have been {disease.recent_report_count} reports of {disease.disease_id} in the past 90 days, and {disease.total_report_count} reports in total.</p>
              <p>Based on the number of reports in the past 90 days, there is currently a <b>{determineRisk(disease.recent_report_count)}</b> of {disease.disease_id}.</p>
              
              <br /><br /><br /><br /><br /><br /><br /><br />
              <h3>Visualisation of case/report frequency around the world</h3>
              <br></br>
              <h3>Predictions (if they exist)</h3>
            </>
          }
      </div>
    </>
  );
}
