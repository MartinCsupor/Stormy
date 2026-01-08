const API_KEY = "8bbe3807862344f523a5e8a6532780f5";

let dailyWeather = [];
let hourlyWeather = [];
let weeklyWeather = [];
let celsius = true;

let hofok = (temp) => {
    return celsius ? Math.round(temp - 273.15) 
        : Math.round((temp - 273.15) * 9/5 + 32);

} ;

const getDailyWeather = async () => {

    const dailyWeather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=46.181793&lon=18.954306&appid=${API_KEY}&lang=hu`
    );
    return dailyWeather;
};

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
};

getHourlyWeather().then( async data => {
    hourlyWeather = await data.json();
    console.log(hourlyWeather);

    //óránkénti időjárás

    const orankenti = document.getElementById("orankenti_idojaras");

    const swiper = document.createElement("div");
    const swiperwrapper = document.createElement("div");

    swiper.classList.add("swiper", "w-full");
    swiperwrapper.classList.add("swiper-wrapper");
 
    orankenti.appendChild(swiper);
    swiper.appendChild(swiperwrapper)
 
    let id = 0;
 
    hourlyWeather.list.slice(0, 8).forEach( ora => {
     
        const slide = document.createElement("div");
        const oraIdo = document.createElement("p");
        const oraIkon = document.createElement("img");
        const oraLeiras = document.createElement("p");
        const oraFok = document.createElement("p");
        const oraEsoWrapper = document.createElement("div");
        const oraEsoIkon = document.createElement("img")
        const oraEso = document.createElement("p");
 
        slide.classList.add("swiper-slide", `slide${id}`, "bg-[#476D98]", "rounded-2xl", "px-15" , "py-2","!flex", "flex-col","items-center", "justify-evenly", "!min-w-[120px]", "text-center")
        oraIdo.innerHTML = new Date(ora.dt * 1000).getHours() + ":00";
        oraIkon.src = "images/svg/snowflake.svg";
        oraIkon.classList.add("max-w-[35px]");
        oraLeiras.innerHTML = ora.weather[0].description.charAt(0).toUpperCase() + ora.weather[0].description.slice(1);
        oraLeiras.classList.add("text-xs");
        oraFok.innerHTML = hofok(ora.main.temp) + (celsius ? "°C" : "°F");
        oraFok.classList.add("font-bold");
        oraEsoWrapper.classList.add("flex", "items-center")
        oraEsoIkon.src = "images/svg/water-drop.svg";
        oraEsoIkon.classList.add("max-w-[12px]", "mr-0.5");
        oraEso.innerHTML = ora.pop*100 + "%";
        oraEso.classList.add("text-sm");
 
 
        slide.appendChild(oraIdo);
        slide.appendChild(oraIkon);
        slide.appendChild(oraLeiras);
        slide.appendChild(oraFok);
        slide.appendChild(oraEsoIkon)
        slide.appendChild(oraEsoWrapper);
        oraEsoWrapper.appendChild(oraEsoIkon)
        oraEsoWrapper.appendChild(oraEso);
        swiperwrapper.appendChild(slide)
 
        id++;
    });
 
 
    new Swiper(".swiper", {
        slidesPerView: 3,
        spaceBetween: 16,
        freeMode: true,
        freeModeSticky: false,
      
        resistance: false,
        momentumBounce: false,
      
        watchOverflow: false,
    });



    //napi időjárás

    const napi = document.getElementById("napi_idojaras");


    let napok = [];
    let esok = [];
    let ikonok = [];
    let minek = [];
    let maxok = [];

    let db = 0;
    hourlyWeather.list.forEach(nap => {
        db++;

        let esokO =  [];
        let ikonokO =  [];
        let minekO = [];
        let maxokO = [];

        esokO.push(nap.pop*100);
        ikonokO.push(nap.weather[0].icon);
        minekO.push(hofok(nap.main.temp_min));
        maxokO.push(hofok(nap.main.temp_max));


        if(db == 8){
            db = 0;

            napok.push(new Date(nap.dt * 1000).toLocaleDateString("hu-HU", {weekday: "long"}));

            esokO = esokO.reduce((a,b) => a + b, 0) / esokO.length;  
            esok.push(esokO);
            esokO = []

            ikonokO = ikonokO.sort((a,b) =>
                ikonokO.filter(v => v===a).length
                - ikonokO.filter(v => v===b).length
            ).pop();
            ikonok.push(ikonokO);


            minekO = esokO.reduce((a,b) => a + b, 0) / minekO.length;  
            minek.push(minekO);
            minekO = []

            maxokO = maxokO.reduce((a,b) => a + b, 0) / maxokO.length;
            maxok.push(maxokO);
            maxokO = []
        }
    });

    for (let i = 0; i < 5; i++){

        const napDiv = document.createElement("div");
        const napNev = document.createElement("p");
        const napEso = document.createElement("p");
        const napIkon = document.createElement("img");
        const napMin = document.createElement("p");
        const napMax = document.createElement("p");

        if (i == 0){
            napNev.innerHTML = "Ma";
        } else {
            napNev.innerHTML = napok[i].charAt(0).toUpperCase() + napok[i].slice(1);
        }
        napEso.innerHTML = esok[i]+"%";
        // napIkon.src = `img/icons/$idojaras${ikon[i]}.png`;
        napMin.innerHTML = minek[i]+ (celsius ? "°C" : "°F");
        napMax.innerHTML = maxok[i]+ (celsius ? "°C" : "°F");


        napi.appendChild(napDiv);
        napi.appendChild(napNev);
        napi.appendChild(napEso);
        napi.appendChild(napIkon);
        napi.appendChild(napMin);
        napi.appendChild(napMax);
    }
});