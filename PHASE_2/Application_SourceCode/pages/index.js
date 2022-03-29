import Head from "next/head";
import Link from "next/link";
import { useContext, useState } from "react";
import NavBar from "../components/NavBar";
import styles from "../styles/Home.module.scss";

export default function Home() {
  const [errMsg, setError] = useState();

  return (
    <>
      <Head>
        <title>Disease Watch</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="content_main">
        <div className={styles.home_content}>
          { errMsg && <div><b style={{color: "red"}}>{errMsg}</b></div> }
        </div>
      </div>
    </>
  );
}
