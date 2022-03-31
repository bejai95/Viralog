import Head from "next/head";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import styles from "../../styles/Disease.module.scss";
export async function getServerSideProps(context) {
  
  const paramsData = {
    names: context.params.disease
  };
  const url = new URL("https://vivid-apogee-344409.ts.r.appspot.com/diseases");
  url.search = new URLSearchParams(paramsData).toString();
  const res = await fetch(url);
  
  try {
    const result = await res.json();
    if (result.status && result.status != 200) {
      return { props: { error: result.message } };
    }
    return { props: { disease: result[0] } };
  }
  catch {
    return {  props: { error: "Failed to get article." } };
  }
}
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
export default function DiseaseInfoPage({ disease, error }) {
  return (
    <>
      <Head>
        <title>{error ? "Invalid Page" : disease.disease_id}</title>
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
          {disease &&
            <>
              <h1>{capitalizeFirstLetter(disease.disease_aliases[0])}</h1>
              
              <h3>Also known as</h3>
              <ul>
                {disease.disease_aliases.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              
              <h3>Symptoms</h3>
              <ul>
                {disease.disease_symptoms.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
              
              <br></br>
              <h3>Visualisation of case/report frequency around the world</h3>
              <br></br>
              <h3>Predictions (if they exist)</h3>
            </>
          }
      </div>
    </>
  );
}