"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/InfoPage.module.scss";
import DiseaseRiskInfo from "../../components/DiseaseRiskInfo";
import ReportList from "../../components/ReportList";

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
              <h1>{capitalizeFirstLetter(disease.disease_id)}</h1>
              
              {getDiseaseAliases(disease.disease_id, disease.aliases)}
              
              {disease.symptoms.length > 0 && <h2>Symptoms</h2>}
              <i>{disease.symptoms.join(", ")}</i>
              
              <h2>Risk Analysis</h2>
              <DiseaseRiskInfo disease={disease}/>
              <i style={{ fontSize: "0.8em"}}>* a disease is &quot;high risk&quot; if it has had 10 or more reports in the past 90 days.</i>

              <h2>Report Frequency</h2>
              <i>(graph of report frequency over time)</i>

              <h2>Recent Reports</h2>
              <ReportList reports={disease.recent_reports}/>
            </>
          }
      </div>
    </>
  );
}
