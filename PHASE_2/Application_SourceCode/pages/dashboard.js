"use strict";
import Head from "next/head";
import Link from "next/link";
import { useContext, useState, useMemo, useEffect } from "react";
import NavBar from "../components/NavBar";
import styles from "../styles/Dashboard.module.scss";
import dynamic from "next/dynamic";
import apiurl from "../utils/apiconn";
import DiseaseRiskInfo from "../components/DiseaseRiskInfo";
import FrequencyGraph from "../components/FrequencyGraph";
import DiseaseInfo from "../components/DiseaseInfo";
import HighRiskDiseasesGraph from "../components/HighRiskDiseasesGraph";
import {
    getCookie,
    setCookies,
    checkCookies,
    removeCookies,
} from "cookies-next";
import { inList } from "../utils/lists";
import SelectWatched from "../components/SelectWatched";
import Dropdown from "../components/Dropdown";

function formatDate(date) {
    return date.toISOString().replace(/\.[0-9]{3}Z$/, "");
}

async function getReports() {
    // Get past 90 days.
    let currDate = new Date();
    const periodEnd = formatDate(currDate);
    currDate.setDate(currDate.getDate() - 90);
    const periodStart = formatDate(currDate);

    const paramsData = {
        period_of_interest_start: periodStart,
        period_of_interest_end: periodEnd,
        key_terms: "",
        location: "",
    };
    const url = new URL(`${apiurl}/reports`);
    url.search = new URLSearchParams(paramsData).toString();
    const res = await fetch(url);
    return await res.json();
}

async function getDiseases() {
    const url = new URL(`${apiurl}/diseases`);
    const res = await fetch(url);
    const diseases = await res.json();
    return diseases;
}

async function getPredictions() {
    const url = new URL(`${apiurl}/predictions?min_report_count=5&day_count=90`);
    const res = await fetch(url);
    const predictions = await res.json();
    return predictions;
}

export async function getServerSideProps(context) {
    return {
        props: {
            reports: await getReports(),
            diseases: await getDiseases(),
        },
    };
}

function getGraphParams(diseases) {
    // Sort by recent report count instead of total report count
    diseases.sort(function (a, b) {
        return b.recent_report_count - a.recent_report_count;
    });

    // Take the top 7 results and get their names and recent report counts
    let xValues = [];
    let yValues = [];
    const diseasesToGraph = diseases.slice(0, 7);
    diseasesToGraph.forEach(function (item, index) {
        xValues[index] = item.disease_id;
        yValues[index] = item.recent_report_count;
    });

    return {
        xValues: xValues,
        yValues: yValues,
    };
}

export default function Home({ reports, diseases, predictions }) {
    const graphParams = getGraphParams(diseases);
    const [watched, setWatched] = useState([]);
    const [minReportCount, setMinReportCount] = useState(5);
    const [dayCount, setDayCount] = useState(90);
    const [pred, setPred] = useState(predictions);

    const possibleDiseases = diseases.map((f) => f.disease_id).sort();

    useEffect(() => {
        // This is to just collect cookies on load
        const cookie = checkCookies("watched")
            ? JSON.parse(getCookie("watched"))
            : [];
        setWatched(cookie);
    }, []);

    useEffect(() => {
        setCookies("watched", watched);
    }, [watched]);

    useEffect(() => {
        const url = new URL(`${apiurl}/predictions?min_report_count=${minReportCount}&day_count=${dayCount}`);
        fetch(url)
            .then(res => res.json())
            .then(result => {
                console.log(result);
                setPred(result);
            });
    }, [dayCount, minReportCount]);

    const dayOptions = [15, 30, 60, 90, 120, 365];
    const minReportOptions = [1, 2, 3, 4, 5, 10, 20, 50, 100];

    return (
        <>
            <Head>
                <title>Dashboard</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />

            <div className={styles.contentMain}>
                <h1 className={styles.mainHeading}>Dashboard</h1>

                <h2 className={styles.mainHeading}>
                    Graph of Active Diseases in the Past 90 Days
                </h2>
                <HighRiskDiseasesGraph
                    xValues={graphParams.xValues}
                    yValues={graphParams.yValues}
                />

                {/* ******* WATCHED DISEASES ******* */}
                <h2 className={styles.mainHeading}>Watched Diseases</h2>
                <div className={styles.activeList}>
                    <SelectWatched
                        watched={watched}
                        setWatched={setWatched}
                        allDiseases={possibleDiseases}
                    />
                    {watched &&
                        diseases
                            .filter((f) => inList(watched, f.disease_id))
                            .map((disease) => (
                                <DiseaseInfo
                                    key={disease.disease_id}
                                    disease={disease}
                                />
                            ))}
                </div>

                {/* ******** ACTIVE DISEASES ******* */}
                <h2 className={styles.mainHeading}>Active Diseases</h2>
                <div className={styles.activeSelector}>
                    <p>Find diseases which have had at least</p>
                    <Dropdown options={minReportOptions} setValue={setMinReportCount} defaultValueIndex={1}/>
                    <p>reports in the last </p>
                    <Dropdown options={dayOptions} setValue={setDayCount} defaultValueIndex={1}/>
                    <p>days.</p>
                </div>
                <div className={styles.activeList}>
                    {pred && pred.length > 0 && pred.map((disease) => (
                        <DiseaseInfo
                            simplified={true}
                            key={disease.disease_id}
                            disease={disease}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}
