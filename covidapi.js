const diff = (a, b) => {
    return a - b >= 0 ? `+${a - b}` : `-${b - a}`;
};
const comma = (x) => {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

let memo;
async function fetchData() {
    if (memo) {
        return memo;
    }
    const todayDataAPI = await fetch(
        "https://covid19.ddc.moph.go.th/api/Cases/today-cases-all"
    ).then((r) => r.json());
    const todayData = await todayDataAPI[0];

    const beforeData = await fetch(
        "https://covid19.ddc.moph.go.th/api/Cases/timeline-cases-all"
    ).then((r) => r.json());
    console.log(todayData.new_case);

    document.getElementById("showWhenFetch").style.display = "block";
    document.getElementById("loading").style.display = "none";

    const yesterdayData =
        //check that last item of "beforeData" array is yesterday or today
        beforeData[beforeData.length - 1].total_case != todayData.total_case
            ? beforeData[beforeData.length - 1]
            : beforeData[beforeData.length - 2];

    document.getElementById("updateDate").innerHTML = todayData.update_date;

    document.getElementById("infected").innerHTML = comma(todayData.new_case);
    document.getElementById("infectedDiff").innerHTML = comma(
        diff(todayData.new_case, yesterdayData.new_case)
    );

    document.getElementById("death").innerHTML = comma(todayData.new_death);
    document.getElementById("deathDiff").innerHTML = comma(
        diff(todayData.new_death, yesterdayData.new_death)
    );

    document.getElementById("recovered").innerHTML = comma(todayData.new_recovered);
    document.getElementById("recoveredDiff").innerHTML = comma(
        diff(todayData.new_recovered, yesterdayData.new_recovered)
    );

    document.getElementById("totalInfected").innerHTML = comma(todayData.total_case);
    document.getElementById("totalDeath").innerHTML = comma(todayData.total_death);
    document.getElementById("totalRecovered").innerHTML = comma(todayData.total_recovered);

    let dataObj = {
        infectedArr: [],
        dateArr: [],
        deathArr: [],
    };

    for (let i = beforeData.length - 29; i < beforeData.length; i++) {
        dataObj.infectedArr.push(beforeData[i].new_case);
        dataObj.deathArr.push(beforeData[i].new_death);

        let thisDateSplited = await beforeData[i].txn_date.split("-");
        let thisDateLocal = `${thisDateSplited[2]}/${thisDateSplited[1]}`;
        dataObj.dateArr.push(thisDateLocal);
    }
    const localDateSplited = todayData.txn_date.split("-");
    const localDateNoYear = `${localDateSplited[2]}/${localDateSplited[1]}`;
    if (localDateNoYear != dataObj.dateArr[dataObj.dateArr.length - 1]) {
        dataObj.infectedArr.push(todayData.new_case);
        dataObj.deathArr.push(todayData.new_death);
        dataObj.dateArr.push(localDateNoYear);
    }

    memo = await dataObj;

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
