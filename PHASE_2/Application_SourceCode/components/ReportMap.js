import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import "leaflet-defaulticon-compatibility";

import L from 'leaflet';

function ReportMap({ reports }) {

	const accessToken = "pk.eyJ1IjoiYWxleGFuZGVybWJyb3duIiwiYSI6ImNsMWJwcWt6bDAwMHkzYm1yOHBuZWM3dHIifQ.7d3DkVxbfJJ8XknsbJYlag";

  console.log(reports[0]);

  const pinIcon = new L.Icon.Default();
  pinIcon.options.shadowSize = [0, 0];

  const groups = {};

  for (let i = 0; i < reports.length; i++) {
    const report = reports[i];
    const groupId = reports[i].location.lat + "||" + reports[i].location.long;
    if (groups[groupId]) {
      groups[groupId].push(report);
    }
    else {
      groups[groupId] = [report];
    }
  }

  const pins = [];
  for (const groupId in groups) {
    const group = groups[groupId];

    pins.push(
      <Marker key={groupId} position={[group[0].location.lat, group[0].location.long]} icon={pinIcon}>
        <Popup>
          {group.map(report =>
            <div key={report.report_id}>{report.diseases[0]}, {report.location.location}</div>
          )}
        </Popup>
      </Marker>
    );
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

export default ReportMap;
