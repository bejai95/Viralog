import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Article.module.scss";

export async function getStaticPaths() {
  
  const res = await fetch('https://vivid-apogee-344409.ts.r.appspot.com/articles?period_of_interest_start=2022-02-30T12%3A00%3A00&period_of_interest_end=2022-03-30T13%3A00%3A00&key_terms=COVID-19%2Ctuberculosis%2Cebola%2Cmalaria%2Chiv%2Faids&location=China%2CAustralia&source=CIDRAP%2CCDC');
  const data = await res.json();

  const paths = data.map((article) => ({
    params: { headline: article.headline },
  }))

  return { 
    paths, 
    fallback: false 
  }
}

export async function getStaticProps(context) {

  const headline = context.params.headline;
  const res = await fetch('https://vivid-apogee-344409.ts.r.appspot.com/articles?period_of_interest_start=2022-02-30T12%3A00%3A00&period_of_interest_end=2022-03-30T13%3A00%3A00&key_terms=COVID-19%2Ctuberculosis%2Cebola%2Cmalaria%2Chiv%2Faids&location=China%2CAustralia&source=CIDRAP%2CCDC');
  const dataArray = await res.json();
  
  let dataObject;
  for (let i = 0; i < dataArray.length; i++) {
    if (dataArray[i].headline === headline) {
      dataObject = dataArray[i];
    }
  }
  
  return { 
    props: { article: dataObject }
  }
}

export default function DiseaseInfoPage({ article }) {
  return (
    <>
      <Head>
        <title>{article.headline}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
        <h1>{article.headline}</h1>
        <h2>Article Details</h2>
        <p>
          <b>Author: </b>
          {article.author}
        </p>
        <p>
          <b>Article URL: </b>
          <a href={article.url} className={styles.urlLink}>{article.url}</a>
        </p>
        <p>
          <b>Publication Date: </b>
          {article.date_of_publication}
        </p>
        <p>
          <b>Category: </b>
          {article.category}
        </p>
        <p>
          <b>Source: </b>
          {article.source}
        </p>
        <br></br>

        <h2>Article Reports</h2>
        <ul>
          {article.reports.map(report => (
            <li key={report.event_date}>
              
              <h3>Diseases</h3>
              <ul>
                {report.diseases.map(disease => (
                  <li key={disease}>{disease}</li>
                ))}
              </ul>

              <h3>Syndromes</h3>
              <ul>
                {report.syndromes.map(syndrome => (
                  <li key={syndrome}>{syndrome}</li>
                ))}
              </ul>

              <p>
                <b>Event Date: </b>
                {report.event_date}
              </p>
              <p>
                <b>Location: </b>
                {report.location}
              </p>

            </li>  
          ))}
        </ul>
      </div>
    </>
  );
}