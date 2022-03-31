import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet-defaulticon-compatibility";
import styles from "../styles/ReportMap.module.scss";
import Link from "next/link";

import L from 'leaflet';

const pinIcon = new L.Icon.Default();
pinIcon.options.shadowSize = [0, 0];

function ReportMap({ reports }) {

	const accessToken = "pk.eyJ1IjoiYWxleGFuZGVybWJyb3duIiwiYSI6ImNsMWJwcWt6bDAwMHkzYm1yOHBuZWM3dHIifQ.7d3DkVxbfJJ8XknsbJYlag";

  const groups = {};

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const groupId = reports[i].location.lat + "||" + reports[i].location.long;
    if (!groups[groupId]) {
      groups[groupId] = {};
    }
    if (!groups[groupId][report.disease_id]) {
      groups[groupId][report.disease_id] = [];
    }
    groups[groupId][report.disease_id].push(report);
  }

  const pins = [];
  for (const groupId in groups) {
    const group = groups[groupId];
    pins.push(generateMarker(groupId, group));
  }

  return (
    <MapContainer center={[0, 0]} zoom={3} style={{ height: "100%", width: "100%", backgroundColor:"#f3f3f3" }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/alexandermbrown/cl1bq5umd000l14pjnqb7e0dm/tiles/256/{z}/{x}/{y}@2x?access_token=${accessToken}`}
        attribution='Map data &copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors, <a href=&quot;https://creativecommons.org/licenses/by-sa/2.0/&quot;>CC-BY-SA</a>, Imagery &copy; <a href=&quot;https://www.mapbox.com/&quot;>Mapbox</a>'
      />
      {pins}
    </MapContainer>
  );
}

function generateMarker(groupId, group) {
  const diseaseLinks = [];
  const diseaseArticles = [];
  let position;

  for (const diseaseId in group) {
    const diseaseReports = group[diseaseId];

    console.log(diseaseId);

    diseaseLinks.push(
      <Link href={"/diseases/" + diseaseId}>
        <a key={diseaseId} className={styles.diseaseLink}>{diseaseReports[0].diseases[0]}</a>
      </Link>
    );

    const reportLinks = [];
    for (let i = 0; i < diseaseReports.length; i++) {
      const report = diseaseReports[i];
      let headline = report.headline;
      if (headline.length > 56) {
        headline = headline.substr(0,56) + "...";
      }
      reportLinks.push(
        <Link href={"/articles/" + report.article_id}>
          <a key={report.report_id}className={styles.report}>{headline}</a>
        </Link>
      );
    }

    diseaseArticles.push(
      <div>
        <h2 key={diseaseId}>{diseaseReports[0].diseases[0]}</h2>
        {reportLinks}
      </div>
    );

    position = [diseaseReports[0].location.lat, diseaseReports[0].location.long];
  }

  return (
    <Marker key={groupId} position={position} icon={pinIcon}>
      <Popup>
        <div className={styles.mapPopup}>
          <div>
            <h1>Diseases Found</h1>
            {diseaseLinks}
          </div>
          <h1>Articles</h1>
          {diseaseArticles}
        </div>
        
      </Popup>
    </Marker>
  );
}

export default ReportMap;
