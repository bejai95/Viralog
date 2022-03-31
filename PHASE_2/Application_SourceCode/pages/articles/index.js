import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Article.module.scss";

export async function getStaticProps() {
  
  const res = await fetch('https://vivid-apogee-344409.ts.r.appspot.com/articles?period_of_interest_start=2022-02-30T12%3A00%3A00&period_of_interest_end=2022-03-30T13%3A00%3A00&key_terms=COVID-19%2Ctuberculosis%2Cebola%2Cmalaria%2Chiv%2Faids&location=China%2CAustralia&source=CIDRAP%2CCDC');

  // For query with all possible articles in our database:
  //https://vivid-apogee-344409.ts.r.appspot.com/articles?period_of_interest_start=1700-01-30T08%3A21%3A01&period_of_interest_end=2050-06-28T08%3A21%3A01&key_terms=&location='
  
  const data = await res.json();

  return {
    props: { articles: data }
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
        <p>(Showing articles from the last month).</p>
        <p><b>Note: </b>Currently this is only an example page, it is only using a template query from the database (lots of articles are missing), will make a better query later which includes all articles from the last month.</p>
        {articles.map(article => (
          <Link href={'/articles/' + article.headline} key={article.url}>
            <a className={styles.articleButton}>
              <h3>{ article.headline }</h3>
            </a>
          </Link>
        ))}
      </div>
    </>
  );
}