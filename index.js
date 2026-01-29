


const API_KEY = "8bbe3807862344f523a5e8a6532780f5";

let dailyWeather = [];
let hourlyWeather = [];
let weeklyWeather = [];
let celsius = true;


const getDailyWeather = async () => {

    const dailyWeather = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?lat=46.181793&lon=18.954306&appid=${API_KEY}&lang=hu`
    );
    return dailyWeather;
};

const getUVIndexAndDewPoint = async () => {
    const UVandDew = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=46.181793&longitude=18.954306&current=temperature_2m,relative_humidity_2m,dew_point_2m,uv_index&timezone=auto`
    );
    const data = await UVandDew.json();

    return {
        dew_point: data.current.dew_point_2m,
        uv_index: data.current.uv_index
    }
}

getDailyWeather().then( async data => {
    dailyWeather = await data.json();
    console.log(dailyWeather)

    const extraJellemzo = await getUVIndexAndDewPoint();

    //jelenlegi időjárás

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


    //napi jellemzők

    const jellemzok = [
        { nev: "Páratartalom", ertek: dailyWeather.main.humidity, egyseg: "%" }, 
        { nev: "Szélsebesség", ertek: dailyWeather.wind.speed, egyseg: " km/h" },
        { nev: "UV Index", ertek: extraJellemzo.uv_index, egyseg: "" },
        { nev: "Légnyomás", ertek: dailyWeather.main.pressure, egyseg: " mb" },
        { nev: "Látótávolság", ertek: dailyWeather.visibility/1000, egyseg: " km" },
        { nev: "Harmatpont", ertek: extraJellemzo.dew_point, egyseg: " °" }
    ]

    const jellemzokContainer = document.getElementById("idojaras_jellemzoi");
    const jellemzokWrapper = document.createElement("div")

    jellemzokContainer.classList.add("max-w-md", "mx-auto");
    jellemzokWrapper.classList.add("grid", "grid-cols-2", "gap-4");

    jellemzok.map(({ nev, ertek, egyseg }) => {
        const jellemzokDiv = document.createElement("div");
        const cim = document.createElement("h3");
        const adat = document.createElement("p");

        jellemzokDiv.classList.add("bg-[#476D98]", "rounded-2xl", "p-4", "text-white");
        cim.classList.add("font-bold", "mb-2");
        adat.classList.add("text-2xl", "text-center");

        cim.innerHTML = nev;
        adat.innerHTML = ertek + egyseg;

        jellemzokDiv.appendChild(cim);
        jellemzokDiv.appendChild(adat);
        jellemzokWrapper.appendChild(jellemzokDiv);
    })

    jellemzokContainer.appendChild(jellemzokWrapper);

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

    swiper.classList.add("swiper", "w-full", "!px-5", "!py-5", "bg-[#82B3DB]", "rounded-lg");
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
 
        slide.classList.add("swiper-slide", `slide${id}`, "bg-[#476D98]", "rounded-2xl", "select-none", "px-15" , "py-2","!flex", "flex-col","items-center", "justify-evenly", "!w-[120px]", "text-center")
        oraIdo.innerHTML = new Date(ora.dt * 1000).getHours() + ":00";
        oraIkon.src = "images/icons/snowflake.svg";
        oraIkon.classList.add("max-w-[35px]");
        oraLeiras.innerHTML = ora.weather[0].description.charAt(0).toUpperCase() + ora.weather[0].description.slice(1);
        oraLeiras.classList.add("text-xs");
        rawHourlyTemps.push(ora.main.temp);
        oraFok.innerHTML = hofok(ora.main.temp) + (celsius ? "°C" : "°F");

        oraFok.classList.add("font-bold");
        oraEsoWrapper.classList.add("flex", "items-center")
        oraEsoIkon.src = "images/icons/water-drop.svg";
        oraEsoIkon.classList.add("max-w-[12px]", "mr-0.5");
        oraEso.innerHTML = Math.round(ora.pop * 100) + "%";

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
        slidesPerView: "auto",
        spaceBetween: 16,
        freeMode: true,      
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

    const napDivWrapper = document.createElement("div");
    napi.appendChild(napDivWrapper);
    napDivWrapper.classList.add("flex", "flex-col", "rounded-lg","bg-[#82B3DB]");

    for (let i = 0; i < 5; i++){

        const napDiv = document.createElement("div");
        const napNev = document.createElement("p");
        const napEsoWrapper = document.createElement("div");
        const napEsoIkon = document.createElement("img")
        const napEso = document.createElement("p");
        const napIkon = document.createElement("img");
        const napminmaxWrapper = document.createElement("div")
        const napMin = document.createElement("p");
        const napMax = document.createElement("p");

        napDiv.classList.add("grid", "grid-cols-4", "bg-[#476D98]","m-2", "p-3", "rounded-lg");
        napEsoWrapper.classList.add("flex", "gap-3");
        napminmaxWrapper.classList.add("flex", "justify-end", "gap-3");
        napEsoIkon.classList.add("w-5");
        napEsoIkon.src = "images/icons/water-drop.svg";

        if (i == 0){
            napNev.innerHTML = "Ma";
        } else {
            napNev.innerHTML = napok[i].charAt(0).toUpperCase() + napok[i].slice(1);
        }
        napEso.innerHTML = Math.round(esok[i]) + "%";
;
        // napIkon.src = `img/icons/$idojaras${ikon[i]}.png`;
        napMin.innerHTML = minek[i]+ (celsius ? "°C" : "°F");
        napMax.innerHTML = maxok[i]+ (celsius ? "°C" : "°F");


        napDivWrapper.appendChild(napDiv);

        napEsoWrapper.appendChild(napEsoIkon);
        napEsoWrapper.appendChild(napEso);
        
        napminmaxWrapper.appendChild(napMin);
        napminmaxWrapper.appendChild(napMax);
    
        napDiv.appendChild(napNev);
        napDiv.appendChild(napEsoWrapper)
        napDiv.appendChild(napIkon);
        napDiv.appendChild(napminmaxWrapper)

        napDivWrapper.append(napDiv)
    }
});

const changeUnit = (unit) => {
    celsius = unit === "celsius";

    document.querySelector(".toggle-celsius")
        .classList.toggle("bg-[#476D98]", celsius);

    document.querySelector(".toggle-fahrenheit")
        .classList.toggle("bg-[#476D98]", !celsius);

    // aktuális
    document.getElementById("jelenlegi_fok").innerHTML =
        hofok(dailyWeather.main.temp) + (celsius ? "°C" : "°F");

    document.getElementById("jelenlegi_hoerzet").innerHTML =
        "Hőérzet: " + hofok(dailyWeather.main.feels_like) + (celsius ? "°C" : "°F");

    document.getElementById("jelenlegi_minmax").innerHTML =
        hofok(dailyWeather.main.temp_min) + (celsius ? "°C" : "°F") +
        "/" +
        hofok(dailyWeather.main.temp_max) + (celsius ? "°C" : "°F");

    // óránkénti
    document.querySelectorAll(".swiper-slide .font-bold").forEach((el, i) => {
        el.innerHTML = hofok(rawHourlyTemps[i]) + (celsius ? "°C" : "°F");
    });

    // napi
    document.querySelectorAll("#napi_idojaras .flex.justify-end").forEach((el, i) => {
        el.children[0].innerHTML = hofok(rawDailyMin[i]) + (celsius ? "°C" : "°F");
        el.children[1].innerHTML = hofok(rawDailyMax[i]) + (celsius ? "°C" : "°F");
    });
};



const hofok = (kelvin) => {
    if (typeof kelvin !== "number") return "";

    const isCelsius = typeof celsius === "boolean" ? celsius : true;

    return isCelsius
        ? Math.round(kelvin - 273.15)
        : Math.round((kelvin - 273.15) * 9 / 5 + 32);
};

let rawHourlyTemps = [];
let rawDailyMin = [];
let rawDailyMax = [];



