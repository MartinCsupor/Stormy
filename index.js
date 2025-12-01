const API_KEY = "8bbe3807862344f523a5e8a6532780f5";

let dailyWeather = [];
let hourlyWeather = [];
let weeklyWeather = [];

const getDailyWeather = async () => {

    const dailyWeather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=10&lon=10&appid=${API_KEY}`
    );
    return dailyWeather;
}

getDailyWeather().then( async data => {
    dailyWeather = await data.json();
    console.log(dailyWeather);
});