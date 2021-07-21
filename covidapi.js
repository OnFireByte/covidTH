const diff = (a, b) => {
    return a - b >= 0 ? `+${a - b}` : `-${b - a}`;
};

async function fetchData() {
    const todayData = await fetch(
        "https://covid19.th-stat.com/json/covid19v2/getTodayCases.json"
    ).then((r) => r.json());

    const beforeDataAPI = await fetch(
        "https://covid19.th-stat.com/json/covid19v2/getTimeline.json"
    ).then((r) => r.json());

    const beforeData = beforeDataAPI.Data;

    const yesterdayData = beforeData[beforeData.length - 1];

    document.getElementById("infected").innerHTML = todayData.NewConfirmed;
    document.getElementById("infectedDiff").innerHTML = diff(
        todayData.NewConfirmed,
        yesterdayData.NewConfirmed
    );

    document.getElementById("death").innerHTML = todayData.NewDeaths;
    document.getElementById("deathDiff").innerHTML = diff(
        todayData.NewDeaths,
        yesterdayData.NewDeaths
    );

    let dataObj = {
        infectedArr: [],
        dateArr: [],
        deathArr: [],
    };

    for (let i = beforeData.length - 14; i < beforeData.length; i++) {
        dataObj.infectedArr.push(beforeData[i].NewConfirmed);
        dataObj.deathArr.push(beforeData[i].NewDeaths);

        thisDate = beforeData[i].Date;
        thisDateSplited = thisDate.split("/");
        thisDateLocal = `${thisDateSplited[1]}/${thisDateSplited[0]}`;
        dataObj.dateArr.push(thisDateLocal);
    }
    dataObj.infectedArr.push(todayData.NewConfirmed);
    dataObj.deathArr.push(todayData.NewDeaths);
    const date = new Date();
    const localDate = date.toLocaleDateString("en-GB");
    const localDateSplited = localDate.split("/");
    const localDateNoYear = `${localDateSplited[0]}/${localDateSplited[1]}`;
    dataObj.dateArr.push(localDateNoYear);

    return dataObj;
}

fetchData();
window.addEventListener("DOMContentLoaded", async () => {
    const infectedArr = await fetchData().then((r) => r.infectedArr);
    const deathArr = await fetchData().then((r) => r.deathArr);
    const dateArr = await fetchData().then((r) => r.dateArr);

    var infectedChart_ctx = document.getElementById("infectedChart").getContext("2d");
    var infectedChart = new Chart(infectedChart_ctx, {
        type: "line",
        data: {
            labels: dateArr,
            datasets: [
                {
                    label: "จำนวนผู้ติดเชื้อต่อวัน",
                    data: infectedArr,
                    backgroundColor: ["rgba(255, 165, 0, 1)"],
                    borderColor: ["rgba(255, 165, 0, 1)"],
                    borderWidth: 2,
                    tension: 0.25,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                },
            },
        },
    });

    var deathChart_ctx = document.getElementById("deathChart").getContext("2d");
    var deathChart = new Chart(deathChart_ctx, {
        type: "line",
        data: {
            labels: dateArr,
            datasets: [
                {
                    label: "จำนวนผู้เสียชีวิตต่อวัน",
                    data: deathArr,
                    backgroundColor: ["rgba(255, 99, 132, 1)"],
                    borderColor: ["rgba(255, 99, 132, 1)"],
                    borderWidth: 2,
                    tension: 0.25,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false,
                },
            },
        },
    });
});
