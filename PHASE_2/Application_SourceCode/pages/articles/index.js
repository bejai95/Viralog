"use strict";
import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/ListPage.module.scss";
import apiurl from "../../utils/apiconn";
import { useRouter } from "next/router";

function formatDate(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

export async function getServerSideProps(context) {
  let time = context.query.time;
  let numDays;
  if (time) {
    if (time === "week") {
      numDays = 7;
    } else if (time === "month") {
      numDays = 30;
    } else if (time === "3-months") {
      numDays = 90;
    } else if (time === "year") {
      numDays = 365;
    }
  } else { 
    numDays = 90;
    time = "3-months";
  }
  
  // Get past [amount] of days
  let currDate = new Date();
  const periodEnd = formatDate(currDate);
  currDate.setDate(currDate.getDate() - numDays);
  const periodStart = formatDate(currDate);

  const paramsData = {
    period_of_interest_start: periodStart,
    period_of_interest_end: periodEnd,
    key_terms: "",
    location: "",
    hideBody: ""
  };
  const url = new URL(`${apiurl}/articles`);
  url.search = new URLSearchParams(paramsData).toString();
  const res = await fetch(url);
  const articles = await res.json();

  return {
    props: { 
      articles: articles,
      time: time,
    },
  };
}

export default function Articles( { articles, time } ) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Recent Articles</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.contentInner}>
        <h2>Recent Articles</h2>
        <div>
          <i>Show articles from the past </i>
          <select name="time" defaultValue={time} className={styles.timeSelect} onChange={select => {
           console.log(select.target.value);
            router.query.time = select.target.value;
            router.push(router);
          }}>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="3-months">3-months</option>
            <option value="year">Year</option>
          </select>
        </div>
        {articles.map(article => (
            <Link href={"/articles/" + encodeURIComponent(article.article_id)} key={article.article_id}>
              <a className={styles.listItem}>
                <h2>{ article.headline }</h2>
                <div><i>{article.author}</i></div>
                <div>
                  <i>Reporting {article.reports.map(
                    report => report.diseases[0] + " in " + report.location.location
                    ).join(", ")}...</i>
                  <span className="float_right" style={{fontSize: "0.8em", marginTop: "6px"}}>{new Date(article.date_of_publication).toLocaleDateString()}</span>
                </div>
                <div style={{clear: "both"}} />
              </a>
            </Link>
            
        ))}
      </div>
    </>
  );
}
