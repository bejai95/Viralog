"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/ListPage.module.scss";
import apiurl from "../../utils/apiconn";

export async function getServerSideProps(context) {
  const searchParam = context.query.search;
  const diseasesParam = context.query.diseases;
  const symptomsParam = context.query.symptoms;
  const riskLevelParam = context.query.riskLevel;

  const paramsData = {};
  if (searchParam) {
    paramsData["search"] = searchParam;
  }
  if (diseasesParam) {
    paramsData["diseases"] = diseasesParam;
  }
  if (symptomsParam) {
    paramsData["symptoms"] = symptomsParam;
  }
  if (riskLevelParam) {
    if (riskLevelParam === "low-risk") {
      paramsData["max_reports"] = 9;
    } else if (riskLevelParam === "high-risk") {
      paramsData["min_reports"] = 10;
    }
  }
  
  const url = new URL(`${apiurl}/diseases`);
  url.search = new URLSearchParams(paramsData).toString();
  const res = await fetch(url);
  const diseases = await res.json();

  return {
    props: {
      diseases: diseases,
      searchParam: searchParam || null,
      diseasesParam: diseasesParam || null,
      symptomsParam: symptomsParam || null,
      riskLevelParam: riskLevelParam || null
    }
  };
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getDiseaseAliases(disease_id, aliases) {
  const filtered = aliases.filter(alias => alias != disease_id);
  if (filtered.length > 0) {
    return <i>(also known as {filtered.join(", ")})</i>;
  }
  return null;
}

export default function Diseases({ diseases, searchParam, diseasesParam, symptomsParam, riskLevelParam }) {
  let params = false;
  if (searchParam || diseasesParam || symptomsParam || riskLevelParam) {
    params = true;
  }

  return (
    <>
      <Head>
        <title>Diseases</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar search={searchParam}/>
      <div className={styles.contentInner}>
        <h2>{params ? "Search Results" : "All Diseases"}</h2>
        <details>
          <summary>Advanced Filtering</summary>
          <form>
            <label htmlFor="diseases-search">Filter by disease (optional)</label>
            <input id="diseases-search" name="diseases" type="text" placeholder="Enter comma separated list of diseases..." 
              defaultValue={diseasesParam}></input>
            <i> e.g. Zika,Ebola,Measles</i>
            <br></br>
            <label htmlFor="symptoms-search">Show only these symptoms (optional)</label>
            <input id="symptoms-search" name="symptoms" type="text" placeholder="Enter comma separated list of symptoms..."
              defaultValue={symptomsParam}></input>
            <i> e.g. fever,cough,fatigue</i>
            <br></br>
            Risk Level
            <br></br>
            <select name="riskLevel" defaultValue={riskLevelParam}>
              <option value="all">All</option>
              <option value="high-risk">High Risk</option>
              <option value="low-risk">Low Risk</option>
            </select>
            <div><i>*Note that a disease is &quot;high risk&quot; if it has had 10 or more reports in the past 90 days.</i></div>
            <button type="submit">Apply Filters</button>
          </form>
        </details>
        <h2>Results:</h2>
        {diseases.map(disease => (
          <Link href={"/diseases/" + encodeURIComponent(disease.disease_id)} key={disease.disease_id}>
            <a className={styles.listItem}>
              <h2>{capitalizeFirstLetter(disease.disease_id)}</h2>
              {getDiseaseAliases(disease.disease_id, disease.aliases)}
              <div>
                {disease.symptoms.length > 0 &&
                  <i>symptoms include {disease.symptoms.join(", ")}.</i>
                }
                <div className="float_right" style={{fontSize: "0.9em"}}>{disease.total_report_count} reports</div>
              </div>
              <div style={{clear: "both"}}></div>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}
