import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Disease.module.scss";

export async function getStaticProps() {

  const res = await fetch('https://jsonplaceholder.typicode.com/users');
  const data = await res.json();

  return {
    props: { diseases: data }
  }
}

export default function Diseases( {diseases } ) {
  
  return (
    <>
      <Head>
        <title>All Diseases</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
        <h1>All Diseases</h1>
        <p>Currently using dummy data, this will be replaced later.</p>
        {diseases.map(disease => (
          <Link href={'/diseases/' + disease.name} key={disease.id}>
            <a className={styles.diseaseButton}>
              <h3>{ disease.name }</h3>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}