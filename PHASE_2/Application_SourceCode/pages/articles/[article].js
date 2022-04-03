"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import ReportList from "../../components/ReportList";
import styles from "../../styles/InfoPage.module.scss";
import { useContext, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import apiurl from "../../utils/apiconn";

export async function getServerSideProps(context) {
  
  const articleId = context.params.article;
  const res = await fetch(`${apiurl}/articles/` + articleId);
  
  try {
    const result = await res.json();

    if (result.status && result.status != 200) {
      return { props: { error: result.message } };
    }
    return { props: { article: result } };
  }
  catch {
    return {  props: { error: "Failed to get article." } };
  }
}

export default function ArticleInfoPage({ article, error }) {

  const ReportMap = useMemo(() => dynamic(
    () => import("../../components/ReportMap"),
    { 
      loading: () => <p>Map is loading...</p>,
      ssr: false
    }
  ), []);

  return (
    <>
      <Head>
        <title>{error ? "Invalid Page" : article.headline + " - Disease Watch"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="contentMain">
        {error && 
          <>
            <h1>Error: Invalid Page</h1>
            <p>
              <b>Message from API: </b>
              {error}
            </p>
          </>
        }
        {article &&
          <div className={styles.infoPage}>
            <Link href={article.article_url} >
              <a className={styles.headline} target="_blank">{article.headline}</a>
            </Link>
            <div className={styles.info}>{article.author}</div>
            <div className={styles.info}>Published {new Date(article.date_of_publication).toLocaleDateString()}</div>
            <h2>Category</h2>
            <div className={styles.info}>{article.category}</div>
            <h2>Source</h2>
            <div className={styles.info}>{article.source}</div>
            <h2>Reports</h2>
            <ReportList reports={article.reports}/>
            <div className={styles.mapContainer}>
              <ReportMap reports={article.reports} hideArticles={true}/>
            </div>
          </div>
        }
      </div>
    </>
  );
}