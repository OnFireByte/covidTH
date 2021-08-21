const diff = (a, b) => {
    return a - b >= 0 ? `+${a - b}` : `-${b - a}`;
};
const comma = (x) => {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

async function fetchData() {
    const todayData = await fetch(
        "https://covid19.th-stat.com/json/covid19v2/getTodayCases.json"
    ).then((r) => r.json());

    const beforeDataAPI = await fetch(
        "https://covid19.th-stat.com/json/covid19v2/getTimeline.json"
    ).then((r) => r.json());

    const beforeData = beforeDataAPI.Data;

    const yesterdayData =
        //check that last item of "beforeData" array is yesterday or today
        beforeData[beforeData.length - 1].Confirmed != todayData.Confirmed
            ? beforeData[beforeData.length - 1]
            : beforeData[beforeData.length - 2];

    document.getElementById("updateDate").innerHTML = todayData.UpdateDate;

    document.getElementById("infected").innerHTML = comma(todayData.NewConfirmed);
    document.getElementById("infectedDiff").innerHTML = comma(
        diff(todayData.NewConfirmed, yesterdayData.NewConfirmed)
    );

    document.getElementById("death").innerHTML = comma(todayData.NewDeaths);
    document.getElementById("deathDiff").innerHTML = comma(
        diff(todayData.NewDeaths, yesterdayData.NewDeaths)
    );

    document.getElementById("hospitalized").innerHTML = comma(todayData.NewHospitalized);
    document.getElementById("hospitalizedDiff").innerHTML = comma(
        diff(todayData.NewHospitalized, yesterdayData.NewHospitalized)
    );

    document.getElementById("recovered").innerHTML = comma(todayData.NewRecovered);
    document.getElementById("recoveredDiff").innerHTML = comma(
        diff(todayData.NewRecovered, yesterdayData.NewRecovered)
    );

    document.getElementById("totalInfected").innerHTML = comma(todayData.Confirmed);
    document.getElementById("totalDeath").innerHTML = comma(todayData.Deaths);
    document.getElementById("totalHospitalized").innerHTML = comma(todayData.Hospitalized);
    document.getElementById("totalRecovered").innerHTML = comma(todayData.Recovered);

    let dataObj = {
        infectedArr: [],
        dateArr: [],
        deathArr: [],
    };

    for (let i = beforeData.length - 29; i < beforeData.length; i++) {
        dataObj.infectedArr.push(beforeData[i].NewConfirmed);
        dataObj.deathArr.push(beforeData[i].NewDeaths);

        thisDate = beforeData[i].Date;
        thisDateSplited = thisDate.split("/");
        thisDateLocal = `${thisDateSplited[1]}/${thisDateSplited[0]}`;
        dataObj.dateArr.push(thisDateLocal);
    }
    const localDateSplited = todayData.UpdateDate.split("/");
    const localDateNoYear = `${localDateSplited[0]}/${localDateSplited[1]}`;
    if (localDateNoYear != dataObj.dateArr[dataObj.dateArr.length - 1]) {
        dataObj.infectedArr.push(todayData.NewConfirmed);
        dataObj.deathArr.push(todayData.NewDeaths);
        dataObj.dateArr.push(localDateNoYear);
    }

    document.getElementById("showWhenFetch").style.display = "block";
    document.getElementById("loading").style.display = "none";

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
            interaction: {
                mode: "index",
                intersect: false,
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
            interaction: {
                mode: "index",
                intersect: false,
            },
        },
    });
});
