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
          <Link href={'/diseases/' + disease.disease_id} key={disease.disease_id}>
            <a className={styles.listItem}>
              <h2>{capitalizeFirstLetter(disease.disease_id)}</h2>
              <i>known as {disease.disease_aliases.join(", ")}.</i>
              <i>symptoms include {disease.disease_symptoms.join(", ")}.</i>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}