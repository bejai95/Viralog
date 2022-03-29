import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Disease.module.scss";

export default function DiseaseInfoPage() {
  const diseaseName = "COVID-19"; // Later this will be retrieved by the API
  const paraContent = "COVID, COVID-19, Coronavirus, ..." // Later this will be retrieved by the API

  return (
    <>
      <Head>
        <title>{diseaseName}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
        <h1>{diseaseName}</h1>
        <h2>Also known as</h2>
        <p>{paraContent}</p>
        <h2>Symptoms</h2>
        <br></br>
        <h2>Visualisation of case/report frequency around the world</h2>
        <br></br>
        <h2>Predictions (if they exist)</h2>
      </div>
    </>
  );
}