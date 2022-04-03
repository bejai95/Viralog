"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/ListPage.module.scss";
import apiurl from "../../utils/apiconn";

export async function getServerSideProps() {
  
  const res = await fetch(`${apiurl}/diseases?names=`);
  const diseases = await res.json();

  return {
    props: { diseases: diseases }
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

export default function Diseases({ diseases }) {
  return (
    <>
      <Head>
        <title>Diseases</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.contentInner}>
        <h2>Diseases</h2>
        {diseases.map(disease => (
          <Link href={"/diseases/" + encodeURIComponent(disease.disease_id)} key={disease.disease_id}>
            <a className={styles.listItem}>
              <h2>{capitalizeFirstLetter(disease.disease_id)}</h2>
              {getDiseaseAliases(disease.disease_id, disease.disease_aliases)}
              {disease.disease_symptoms.length > 0 &&
                <i>symptoms include {disease.disease_symptoms.join(", ")}.</i>
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
