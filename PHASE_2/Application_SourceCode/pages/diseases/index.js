"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/ListPage.module.scss";
import apiurl from "../../utils/apiconn";

export async function getServerSideProps(context) {
  const diseasesParam = context.query.diseases;
  const symptomsParam = context.query.symptoms;
  
  const res = await fetch(`${apiurl}/diseases?names=${encodeURIComponent(diseasesParam)}`);
  const diseases = await res.json();

  return {
    props: {
      diseases: diseases,
      diseasesParam: diseasesParam || null,
      symptomsParam: symptomsParam || null
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

export default function Diseases({ diseases, diseasesParam, symptomsParam }) {
  let usedFilters = false;
  if (diseasesParam || symptomsParam) {
    usedFilters = true;
  }
  
  return (
    <>
      <Head>
        <title>Diseases</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.contentInner}>
        <h2>Disease Filters</h2>
        <p>Please enter a comma seperated list of diseases and/or symptoms. If a field is left blank then results will not be filtered by that field.</p>
        
        <form>
          <label htmlFor="diseases-search">Filter by disease: </label>
          <input id="diseases-search" name="diseases" type="text" placeholder="e.g. Zika,Ebola,Measles" 
            defaultValue={diseasesParam || ""}></input>
          <br></br>
          <label htmlFor="symptoms-search">Filter by symptom: </label>
          <input id="symptoms-search" name="symptoms" type="text" placeholder="e.g. fever,cough,fatigue"
            defaultValue={symptomsParam || ""}></input>
          <br></br>
          <button type="button">
            <a href="http://localhost:3000/diseases?diseases=&symptoms=">Reset</a>
          </button>
          <button type="submit">Search</button>
        </form>
        
        <h2>{usedFilters ? "Diseases matching search (press reset to view all diseases)" : "All Diseases"}</h2>
        {diseases.map(disease => (
          <Link href={"/diseases/" + encodeURIComponent(disease.disease_id)} key={disease.disease_id}>
            <a className={styles.listItem}>
              <h2>{capitalizeFirstLetter(disease.disease_id)}</h2>
              {getDiseaseAliases(disease.disease_id, disease.aliases)}
              {disease.symptoms.length > 0 &&
                <i>symptoms include {disease.symptoms.join(", ")}.</i>
              }
              <div className="float_right" style={{fontSize: "0.9em"}}>{disease.report_count} reports</div>
              <div style={{clear: "both"}}></div>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}
