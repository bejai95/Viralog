import Head from "next/head";
import Link from "next/link";
import { useContext, useState, useMemo } from "react";
import NavBar from "../components/NavBar";
import styles from "../styles/Home.module.scss";
import dynamic from 'next/dynamic'

export default function Home() {
  const [errMsg, setError] = useState();

  const Map = useMemo(() => dynamic(
    () => import('../components/Map'),
    { 
      loading: () => <p>Map is loading...</p>,
      ssr: false
    }
  ), []);

  return (
    <>
      <Head>
        <title>Disease Watch</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.box}>
        <NavBar />
        { errMsg && <div><b style={{color: "red"}}>{errMsg}</b></div> }
        <div className={styles.map}>
          <Map />
        </div>
      </div>
    </>
  );
}
