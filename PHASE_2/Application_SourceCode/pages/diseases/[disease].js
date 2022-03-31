import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Disease.module.scss";

export async function getServerSideProps(context) {
  
  const diseaseId = context.params.disease;
  const res = await fetch('https://vivid-apogee-344409.ts.r.appspot.com/diseases?names=' + diseaseId);
  
  try {
    const result = await res.json();

    if (result.status && result.status != 200) {
      return { props: { error: result.message } };
    }
    return { props: { disease: result[0] } };
  }
  catch {
    return {  props: { error: "Failed to get article." } };
  }
}

export default function DiseaseInfoPage({ disease, error }) {
  return (
    <>
      <Head>
        <title>{error ? "Invalid Page" : disease.disease_id}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
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
              <h1>{disease.disease_id}</h1>
              <h3>Also known as</h3>
              <p>{disease.disease_aliases}</p>
              <h3>Symptoms</h3>
              <p>{disease.disease_symptoms}</p>
              <br></br>
              <h3>Visualisation of case/report frequency around the world</h3>
              <br></br>
              <h3>Predictions (if they exist)</h3>
            </>
          }
      </div>
    </>
  );
}