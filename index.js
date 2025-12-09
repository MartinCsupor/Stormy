const API_KEY = "8bbe3807862344f523a5e8a6532780f5";

let dailyWeather = [];
let hourlyWeather = [];
let weeklyWeather = [];
let celsius = true;

let hofok = (temp) => {
    return celsius ? Math.round(temp - 273.15) 
        : Math.round((temp - 273.15) * 9/5 + 32);

} 

const getDailyWeather = async () => {

    const dailyWeather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=46.181793&lon=18.954306&appid=${API_KEY}&lang=hu`
    );
    return dailyWeather;
}

getDailyWeather().then( async data => {
    dailyWeather = await data.json();

    const fok = document.getElementById("jelenlegi_fok");
    const ikon = document.getElementById("jelenlegi_idojaras_ikon");
    const leiras = document.getElementById("jelenglegi_idojaras_ikon_leiras");
    const hoerzet = document.getElementById("jelenlegi_hoerzet");
    const varos = document.getElementById("jelenlegi_varos");
    const ido = document.getElementById("jelenlegi_ido");
    const minmax = document.getElementById("jelenlegi_minmax");

    fok.innerHTML = (hofok(dailyWeather.main.temp) + (celsius ? "°C" : "°F"));
    ikon.src = "";
    leiras.innerHTML = dailyWeather.weather[0].description.charAt(0).toUpperCase() + dailyWeather.weather[0].description.slice(1);
    hoerzet.innerHTML = "Hőérzet: " + hofok(dailyWeather.main.feels_like) + (celsius ? "°C" : "°F");
    varos.innerHTML = dailyWeather.name;
    ido.innerHTML = new Date().toLocaleTimeString("hu-HU", {hour: "2-digit", minute: "2-digit"});
    minmax.innerHTML = hofok(dailyWeather.main.temp_min) + (celsius ? "°C" : "°F") + "/" + hofok(dailyWeather.main.temp_max) + (celsius ? "°C" : "°F");

});

const getHourlyWeather = async () => {
    const weeklyWeather = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=46.181793&lon=18.954306&appid=${API_KEY}&lang=hu`
    );
    return weeklyWeather;
}

getHourlyWeather().then( async data => {
    hourlyWeather = await data.json();
    console.log(hourlyWeather);

    //óránkénti időjárás

    const orankenti = document.getElementById("orankenti_idojaras");

    hourlyWeather.list.slice(0, 8).forEach( ora => {
        const oraDiv = document.createElement("div");
        const oraIdo = document.createElement("p");
        const oraIkon = document.createElement("img");
        const oraLeiras = document.createElement("p");
        const oraFok = document.createElement("p");
        const oraEso = document.createElement("p");

        oraIdo.innerHTML = new Date(ora.dt * 1000).getHours() + ":00";
        oraIkon.src = ``;
        oraLeiras.innerHTML = ora.weather[0].description.charAt(0).toUpperCase() + ora.weather[0].description.slice(1);
        oraFok.innerHTML = hofok(ora.main.temp) + (celsius ? "°C" : "°F");
        oraEso.innerHTML = ora.pop*100 + "%";

        orankenti.appendChild(oraDiv);

        oraDiv.appendChild(oraIdo);
        oraDiv.appendChild(oraIkon);
        oraDiv.appendChild(oraLeiras);
        oraDiv.appendChild(oraFok);
        oraDiv.appendChild(oraEso);
    });

    //napi időjárás

    const napi = document.getElementById("napi_idojaras");


});