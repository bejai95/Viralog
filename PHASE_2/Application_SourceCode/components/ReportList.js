"use strict";
import Link from "next/link";
import styles from "../styles/ReportList.module.scss";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString();
}

export default function ReportList({ reports }) {
  return (
	<ul className={styles.reportList}>
		{reports && reports.map(report => (
      <li key={report.report_id}>
        <i>
          <Link href={"/diseases/" + encodeURIComponent(report.diseases[0])}>
            <a>{report.diseases[0]}</a>
          </Link>
          <span> reported in</span>
          <b> {report.location.location}</b> on
          <b> {formatDate(report.event_date)}</b>
        </i>
        <div className={styles.symptoms}>syndromes and symtoms include {report.syndromes.map(s => s.toLowerCase()).join(", ")}</div>
      </li>
		))}
	</ul>
  );
}
