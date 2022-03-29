import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Disease.module.scss";

export async function getStaticPaths() {
  
  const res = await fetch('https://jsonplaceholder.typicode.com/users')
  const data = await res.json();

  const paths = data.map((disease) => ({
    params: { disease: disease.name },
  }))

  return { 
    paths, 
    fallback: false 
  }
}

export async function getStaticProps(context) {

  const diseaseName = context.params.disease;
  const res = await fetch('https://jsonplaceholder.typicode.com/users/?name=' + diseaseName);
  const dataArray = await res.json();
  const dataObject = dataArray[0];


  return { 
    props: { disease: dataObject }
  }
}

export default function DiseaseInfoPage({ disease }) {
  return (
    <>
      <Head>
        <title>{disease.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
        <h1>{disease.name}</h1>
        <h2>Also known as</h2>
        <p>{disease.address.street}</p>
        <h2>Symptoms</h2>
        <p>{disease.company.catchPhrase}</p>
        <br></br>
        <h2>Visualisation of case/report frequency around the world</h2>
        <br></br>
        <h2>Predictions (if they exist)</h2>
      </div>
    </>
  );
}