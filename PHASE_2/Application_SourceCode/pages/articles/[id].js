import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Article.module.scss";

export async function getServerSideProps(context) {
  const articleId = context.params.id;
  const res = await fetch('https://vivid-apogee-344409.ts.r.appspot.com/articles/' + articleId);
  try {
    const result = await res.json();

    if (result.status != 200) {
      return { props: { error: result.message } };
    }
    return { props: { article: result } };
  }
  catch {
    return {  props: { error: "Failed to get article." } };
  }
}

export default function DiseaseInfoPage({ article, error }) {
  return (
    <>
      <Head>
        <title>{error ? "Invalid Page" : article.headline}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className={styles.content}>
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
          <div>
            <h1>{article.headline}</h1>
            <h2>Article Details</h2>
            <p><b>Author: </b>{article.author}</p>
            <p><b>Article URL: </b><a href={article.article_url} className={styles.urlLink}>{article.article_url}</a></p>
            <p><b>Publication Date: </b>{article.date_of_publication}</p>
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
              {article.reports && article.reports.map(report => (
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
    
                  <p><b>Event Date: </b>{report.event_date}</p>
                  <p><b>Location: </b>{report.location.location}</p>
    
                </li>  
              ))}
            </ul>
            </div>
        }
        
        
      </div>
    </>
  );
}