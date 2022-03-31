import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Disease.module.scss";

export async function getServerSideProps() {
  
  const res = await fetch('https://vivid-apogee-344409.ts.r.appspot.com/diseases?names=');
  const diseases = await res.json();

  return {
    props: { diseases: diseases }
  }
}

export default function Diseases( { diseases } ) {
  
  return (
    <>
      <Head>
        <title>All Diseases</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
        <h1>All Diseases</h1>
        {diseases.map(disease => (
          <Link href={'/diseases/' + disease.disease_id} key={disease.disease_id}>
            <a className={styles.diseaseButton}>
              <h3>{disease.disease_id}</h3>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}