import Head from "next/head";
import Link from "next/link";

export default function ReportList({ reports }) {
  return (
	<ul>
		{reports && reports.map(report => (
      <li key={report.event_date}>
        <h3>Diseases</h3>
        <ul>
          {report.diseases.map(disease => (
            <li key={disease}>{disease}</li>
          ))}
        </ul>

        <h3>Syndromes</h3>
        <ul>{
          report.syndromes.map(syndrome => (
            <li key={syndrome}>{syndrome}</li>
          ))
        }</ul>

        <p><b>Event Date: </b>{report.event_date}</p>
        <p><b>Location: </b>{report.location.location}</p>

      </li>
		))}
	</ul>
  );
}
