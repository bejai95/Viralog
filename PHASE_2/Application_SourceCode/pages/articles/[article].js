"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import ReportList from "../../components/ReportList";
import styles from "../../styles/Article.module.scss";
import { useContext, useState, useMemo } from "react";
import dynamic from "next/dynamic";

export async function getServerSideProps(context) {
  
  const articleId = context.params.article;
  const res = await fetch("https://vivid-apogee-344409.ts.r.appspot.com/articles/" + articleId);
  
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
        <title>{error ? "Invalid Page" : article.headline}</title>
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
          <div className={styles.article}>
            <Link href={article.article_url}>
              <a className={styles.headline}>{article.headline}</a>
            </Link>
            <br></br>
            <i>Author: {article.author}</i>
            <i>Date published: {article.date_of_publication}</i>
            <p>
              <b>Category: </b> {article.category}
            </p>
            <p>
              <b>Source: </b> {article.source}
            </p>
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