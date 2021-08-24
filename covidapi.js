const diff = (a, b) => {
    return a - b >= 0 ? `+${a - b}` : `-${b - a}`;
};
const comma = (x) => {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

let fetchData_cache;
const fetchData = async () => {
    if (fetchData_cache) return fetchData_cache; //return cache so we dont have to fetch data again

    const todayData = await fetch("./testdata/getTodayCases.json").then((r) => r.json());

    const beforeDataAPI = await fetch("./testdata/getTimeline.json").then((r) => r.json());
    const beforeData = beforeDataAPI.Data;

    let dataObj = {
        Datas: [...beforeData, todayData],
        infectedArr: [],
        dateArr: [],
        deathArr: [],
    };

    beforeData
        .slice(-30) //keep only last 30 items in array
        .forEach((data) => {
            dataObj.infectedArr.push(data.NewConfirmed);
            dataObj.deathArr.push(data.NewDeaths);

            thisDateSplited = data.Date.split("/");
            thisDateLocal = `${thisDateSplited[1]}/${thisDateSplited[0]}`;
            dataObj.dateArr.push(thisDateLocal);
        });

    const localDateSplited = todayData.UpdateDate.split("/");
    const localDateNoYear = `${localDateSplited[0]}/${localDateSplited[1]}`;
    if (localDateNoYear != dataObj.dateArr[dataObj.dateArr.length - 1]) {
        dataObj.infectedArr.push(todayData.NewConfirmed);
        dataObj.deathArr.push(todayData.NewDeaths);
        dataObj.dateArr.push(localDateNoYear);
    }

    fetchData_cache = dataObj;
    return dataObj;
};

const updateDataInSite = async () => {
    const RawDatas = await fetchData();
    const Datas = RawDatas.Datas;
    const todayData = await Datas[Datas.length - 1];
    const yesterdayData = await Datas[Datas.length - 2];

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

    document.getElementById("showWhenFetch").style.display = "block";
    document.getElementById("loading").style.display = "none";
};

fetchData();
updateDataInSite();

window.addEventListener("DOMContentLoaded", async () => {
    const rawDatas = await fetchData();
    const infectedArr = rawDatas.infectedArr;
    const deathArr = rawDatas.deathArr;
    const dateArr = rawDatas.dateArr;

    updateDataInSite();

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
