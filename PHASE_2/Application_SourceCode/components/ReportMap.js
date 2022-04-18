"use strict";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet-defaulticon-compatibility";
import styles from "../styles/ReportMap.module.scss";
import Link from "next/link";
import L from "leaflet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import ReportHelp from "./ReportHelp";

const pinIcon = new L.Icon.Default();
pinIcon.options.shadowSize = [0, 0];

function ReportMap({ reports, hideArticles, zoom }) {
	const accessToken = "pk.eyJ1IjoiYWxleGFuZGVybWJyb3duIiwiYSI6ImNsMWJwcWt6bDAwMHkzYm1yOHBuZWM3dHIifQ.7d3DkVxbfJJ8XknsbJYlag";

  const groups = {};

  // Get average report position to set center.
  let minLat = reports.length > 0 ? reports[0].location.lat : 0;
  let maxLat = reports.length > 0 ? reports[0].location.lat : 0;
  let minLong = reports.length > 0 ? reports[0].location.long : 0;
  let maxLong = reports.length > 0 ? reports[0].location.long : 0;

  if (reports) {
    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      const groupId = report.location.lat + "||" + report.location.long;
      const diseaseId = report.disease_id || report.diseases[0];

      minLat = Math.min(minLat, report.location.lat);
      maxLat = Math.max(maxLat, report.location.lat);
      minLong = Math.min(minLong, report.location.long);
      maxLong = Math.max(maxLong, report.location.long);

      if (!groups[groupId]) {
        groups[groupId] = { 
          location: report.location.location,
          diseases: {}
        };
      }
      if (!groups[groupId].diseases[diseaseId]) {
        groups[groupId].diseases[diseaseId] = [];
      }
      groups[groupId].diseases[diseaseId].push(report);
    }
  }

  let center = [
    (maxLat + minLat) / 2,
    (maxLong + minLong) / 2,
  ];

  const pins = [];
  for (const groupId in groups) {
    const group = groups[groupId];
    pins.push(generateMarker(groupId, group, hideArticles));
  }

  return (
    <MapContainer center={center} zoom={zoom || 3} style={{ height: "100%", width: "100%", backgroundColor:"#f3f3f3" }}>
      <TileLayer
        url={`https://api.mapbox.com/styles/v1/alexandermbrown/cl1bq5umd000l14pjnqb7e0dm/tiles/256/{z}/{x}/{y}@2x?access_token=${accessToken}`}
        attribution="Map data &copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors, <a href=&quot;https://creativecommons.org/licenses/by-sa/2.0/&quot;>CC-BY-SA</a>, Imagery &copy; <a href=&quot;https://www.mapbox.com/&quot;>Mapbox</a>"
      />
      {pins}
    </MapContainer>
  );
}

function formatDate(date) {
  const dateArr = date.toDateString().split(" ");
  return dateArr[2] + " " + dateArr[1] + " " + dateArr[3];
}

function generateMarker(groupId, group, hideArticles) {
  const diseaseLinks = [];
  let position;

  for (const diseaseId in group.diseases) {
    const diseaseReports = group.diseases[diseaseId];

    const reportLinks = [];
    if (!hideArticles) {
      for (let i = 0; i < diseaseReports.length; i++) {
        const report = diseaseReports[i];
        let headline = report.headline;
        const MAX_HEADLINE_LENGTH = 54;
        if (headline.length > MAX_HEADLINE_LENGTH) {
          headline = headline.substr(0,MAX_HEADLINE_LENGTH) + "...";
        }
        reportLinks.push(
          <li>
            <Link href={"/articles/" + report.article_id} key={report.report_id}>
              <a className={styles.report}>
                <div>{headline}</div>
                <span>{report.source}, {formatDate(new Date(report.event_date))}</span>
              </a>
            </Link>
          </li>
        );
      }
    }

    diseaseLinks.push(
      <li key={diseaseId}>
        <Link href={"/diseases/" + diseaseId} >
          <a className={styles.diseaseLink}>{diseaseReports[0].diseases[0]}</a>
        </Link>
        <ul className={styles.articleList}>
          {reportLinks}
        </ul>
      </li>
    );

    position = [diseaseReports[0].location.lat, diseaseReports[0].location.long];
  }

  let location = group.location;
  const MAX_LOCATION_LENGTH = 20;
  if (location.length > MAX_LOCATION_LENGTH) {
    location = location.substr(0,MAX_LOCATION_LENGTH) + "...";
  }

  return (
    <Marker key={groupId} position={position} icon={pinIcon}>
      <Popup maxWidth={"38em"}>
        <div className={styles.mapPopup}>
          <FontAwesomeIcon className={styles.warn} icon={faTriangleExclamation} size="lg" />
          <h1>Disease Reports in {location}</h1>
          <ReportHelp />
          <ul className={styles.diseaseLinks}>
            {diseaseLinks}
          </ul>
        </div>
        
      </Popup>
    </Marker>
  );
}

export default ReportMap;
