const API_KEY = "8bbe3807862344f523a5e8a6532780f5";

let dailyWeather = [];
let hourlyWeather = [];
let weeklyWeather = [];
let celsius = true;

const getDailyWeather = async () => {

    const dailyWeather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=10&lon=10&appid=${API_KEY}`
    );
    return dailyWeather;
}

getDailyWeather().then( async data => {
    dailyWeather = await data.json();
    console.log(dailyWeather);

    const fok = document.getElementById("jelenlegi_fok");
    const ikon = document.getElementById("jelenlegi_idojaras_ikon");
    const leiras = document.getElementById("jelenglegi_idojaras_ikon_leiras");
    const hoerzet = document.getElementById("jelenlegi_hoerzet");
    const varos = document.getElementById("jelenlegi_varos");
    const ido = document.getElementById("jelenlegi_ido");
    const minmax = document.getElementById("jelenlegi_minmax");

    let hofok = (temp) => {
        celsius ? Math.round(temp - 273.15) 
            : Math.round((temp - 273.15) * 9/5 + 32);

    } 

    console.log(hofok(dailyWeather.main.temp))
    fok.innerHTML = hofok(dailyWeather.main.temp) + celsius ? "°C" : "°F";
    ikon.src = "";
    leiras.innerHTML = dailyWeather.weather[0].description;
    hoerzet.innerHTML = "Hőérzet: " + hofok(dailyWeather.main.feels_like) + celsius ? "°C" : "°F";
    varos.innerHTML = "";
    ido.innerHTML = "";
    minmax.innerHTML = "";

});

const getHourlyWeather = async () => {
    const weeklyWeather = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=44.34&lon=10.99&appid=${API_KEY}`
    );
    return weeklyWeather;
}

getHourlyWeather().then( async data => {
    hourlyWeather = await data.json();
});
