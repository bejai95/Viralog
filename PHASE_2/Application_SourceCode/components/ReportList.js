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
    { (!reports || reports.length == 0) && 
    <i>No reports found.</i>
    }
		{reports && reports.map(report => (
      <li key={report.report_id}>
        {
          report.article_id && report.headline &&
          <Link href={"/articles/" + encodeURIComponent(report.article_id)}>
            <a><b>{report.headline}</b></a>
          </Link>
        }
        <div>
          <Link href={"/diseases/" + encodeURIComponent(report.diseases[0])}>
            <a><i>{report.diseases[0]}</i></a>
          </Link>
          <span> reported in <i>{report.location.location}</i> on <i>{formatDate(report.event_date)}</i></span>
        </div>
        {
          report.syndromes &&
            <div className={styles.symptoms}>syndromes and symtoms include {report.syndromes.map(s => s.toLowerCase()).join(", ")}</div>
        }
      </li>
		))}
	</ul>
  );
}
