import Head from "next/head";
import Link from "next/link";
import { useContext, useState } from "react";
import NavBar from "../components/NavBar";
import styles from "../styles/Disease.module.scss";

export default function Disease() {
  const [errMsg, setError] = useState();
  const diseaseName = "COVID-19";
  const paraContent = "COVID, COVID-19, Coronavirus, ..."

  return (
    <>
      <Head>
        <title>{diseaseName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="content_main">
        <div className={styles.disease_content}>
          { errMsg && <div><b style={{color: "red"}}>{errMsg}</b></div> }
          <h1>{diseaseName}</h1>
          <h2>Also known as</h2>
          <p>{paraContent}</p>
          <h2>Symptoms</h2>
          <br></br>
          <h2>Visualisation of case/report frequency around the world</h2>
          <br></br>
          <h2>Predictions (if they exist)</h2>
        </div>
      </div>
    </>
  );
}