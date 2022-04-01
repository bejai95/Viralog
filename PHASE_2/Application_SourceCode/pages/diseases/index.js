"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/ListPage.module.scss";

export async function getServerSideProps() {
  
  const res = await fetch('https://vivid-apogee-344409.ts.r.appspot.com/diseases?names=');
  const diseases = await res.json();

  return {
    props: { diseases: diseases }
  }
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function Diseases( { diseases } ) {
  
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
          <Link href={'/diseases/' + encodeURIComponent(disease.disease_id)} key={disease.disease_id}>
            <a className={styles.listItem}>
              <h2>{capitalizeFirstLetter(disease.aliases[0])}</h2>
              <i>{disease.aliases.length > 1 &&
                <>(also known as {disease.aliases.slice(1).join(", ")})</>
              }</i>
                  <i>symptoms include {disease.symptoms.join(", ")}.</i>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}