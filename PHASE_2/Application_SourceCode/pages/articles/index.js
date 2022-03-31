import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Article.module.scss";

function formatDate(date) {
  return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

export async function getServerSideProps() {
  
  // Get past 30 days.
  let currDate = new Date();
  const periodEnd = formatDate(currDate);
  currDate.setDate(currDate.getDate() - 30);
  const periodStart = formatDate(currDate);

  const paramsData = {
    period_of_interest_start: periodStart,
    period_of_interest_end: periodEnd,
    key_terms: "",
    location: "",
    hideBody: ""
  };
  const url = new URL("https://vivid-apogee-344409.ts.r.appspot.com/articles");
  url.search = new URLSearchParams(paramsData).toString();
  const res = await fetch(url);
  const articles = await res.json();

  return {
    props: { articles: articles },
  }
}

export default function Articles( { articles } ) {
  
  return (
    <>
      <Head>
        <title>Recent Articles</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
        <h1>Recent Articles</h1>
        <p>Articles from the past 30 days...</p>
        {articles.map(article => (
          <Link href={'/articles/' + article.article_id} key={article.article_id}>
            <a className={styles.articleButton}>
              <h3>{ article.headline }</h3>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}