const API_KEY = "8bbe3807862344f523a5e8a6532780f5";

let dailyWeather = [];
let hourlyWeather = [];
let weeklyWeather = [];
let unit = "celsius";
let celsius = true;
let lat = 46.1833 //átmeneti
let lon = 18.9538
let rawHourlyTemps = [];
let rawDailyMin = [];
let rawDailyMax = [];


const moonPhasesHU = {
    "New Moon": "Újhold",
    "Waxing Crescent": "Növekvő sarló",
    "First Quarter": "Első negyed",
    "Waxing Gibbous": "Növekvő hold",
    "Full Moon": "Telihold",
    "Waning Gibbous": "Fogyó hold",
    "Last Quarter": "Utolsó negyed",
    "Waning Crescent": "Fogyó sarló"
};

const automaticLocator = async () => {
    const res = await fetch("https://ipapi.co/city/");
    const data = await res.text();
    return data
}

const renderAutomatic = async () => {
    const varos = await automaticLocator()
    const koordinatak = await getCoords(varos)
    lat = koordinatak.lat
    lon = koordinatak.lon
    renderWeather()
    renderHourlyWeahter()
}

const getDailyWeather = async () => {
    
    const dailyWeather = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=hu`
    );
    return dailyWeather;
};

const getUVIndexAndDewPoint = async () => {
    const UVandDew = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,dew_point_2m,uv_index&timezone=auto`
    );
    const data = await UVandDew.json();
    
    return {
        dew_point: data.current.dew_point_2m,
        uv_index: data.current.uv_index
        
    }
}

const getMoonData = async () => {
    const data = await fetch(
        `https://api.solunar.org/solunar/lat=${lat}&lon=${lon},${new Date().toLocaleDateString('sv-SE').replaceAll('-', '')},1`
    )
    const MoonData = await data.json()
    
    return {
        moonrise: MoonData.moonRise,
        moonset: MoonData.moonSet,
        moonphase: MoonData.moonPhase
    }
}

const getCoords = async (e) => {    
    const varos = e.target.value

    const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${varos}&limit=5&appid=${API_KEY}&lang=hu`
    );
    
    if (!res.ok){
        return false
    }

    const data = await res.json()
    console.log(data)

    talalatok.innerHTML = ""

    data.forEach(varos => {
        const div = document.createElement("div")
        div.classList.add("bg-[#82B3DB]", "hover:bg-[#476D98]", "rounded-lg", "px-2", "py-1")
        div.textContent = varos.name

        div.addEventListener("click", () => {
            lat =varos.lat
            lon = varos.lon
            renderWeather()
            renderHourlyWeahter()
            talalatok.innerHTML = ""
        })
        
        talalatok.appendChild(div)
    })
    
    if(data.length > 0)
        return {
            lat: data[0].lat,
            lon: data[0].lon
        }

    return false
}

const varosInput = document.getElementById("varosinput")
const talalatok = document.getElementById("talalatok");
varosInput.addEventListener("input", (e) => getCoords(e));

const renderWeather = async () => {
    const data = await getDailyWeather();
    dailyWeather = await data.json()
    console.log(dailyWeather)

    const extraJellemzo = await getUVIndexAndDewPoint();
    const holdJellemzok = await getMoonData();

    // Vitamin ajánló frissítése az adatokkal (Kelvin -> Celsius konverzióval)
    vitaminAjanlo(dailyWeather.weather[0].main, dailyWeather.main.temp - 273.15, extraJellemzo.uv_index);

    //jelenlegi időjárás

    const jelenlegiDiv = document.getElementById("jelenlegi_idojaras")
    jelenlegiDiv.innerHTML = "";

    const balWrapper = document.createElement("div")
    const fok = document.createElement("h2");
    const ikon = document.createElement("img")
    const leiras = document.createElement("p")  
    const ikonWrapper = document.createElement("div")
    const hoerzet = document.createElement("p")
    const jelenlegiJellWrapper = document.createElement("div")
    const varos = document.createElement("p")
    const ido = document.createElement("p")
    const minmax = document.createElement("p")
    const varosWrapper = document.createElement("div")
    const minmaxWrapper = document.createElement("div")

    balWrapper.classList.add("flex", "flex-col", "justify-between")
    fok.classList.add("font-bold", "text-3xl", "pl-1")
    ikon.alt = "Időjárás ikon"
    leiras.classList.add("font-bold", "pl-2")
    hoerzet.classList.add("font-bold")
    varos.classList.add("font-bold", "text-3xl", "text-right")
    ido.classList.add("font-bold", "text-right")
    minmax.classList.add("font-bold", "text-right")
    jelenlegiJellWrapper.classList.add("flex", "flex-col", "justify-between")
    ikonWrapper.classList.add("flex", "items-center")

    fok.innerHTML = hofok(dailyWeather.main.temp) + getUnitSymbol();
    fok.id = "jelenlegi_fok";
    ikon.src = `images/icons/weather/${dailyWeather.weather[0].icon}.svg`;
    ikon.classList.add("h-20")
    leiras.innerHTML = dailyWeather.weather[0].description.charAt(0).toUpperCase() + dailyWeather.weather[0].description.slice(1);
    hoerzet.innerHTML = "Hőérzet: " + hofok(dailyWeather.main.feels_like) + getUnitSymbol();
    hoerzet.id = "jelenlegi_hoerzet";
    varos.innerHTML = dailyWeather.name;
    ido.innerHTML = new Date().toLocaleTimeString("hu-HU", {hour: "2-digit", minute: "2-digit"});
    minmax.innerHTML = hofok(dailyWeather.main.temp_min) + getUnitSymbol() + "/" + hofok(dailyWeather.main.temp_max) + getUnitSymbol();
    minmax.id = "jelenlegi_minmax";

    varosWrapper.appendChild(varos)
    varosWrapper.appendChild(ido)
    minmaxWrapper.appendChild(minmax)

    balWrapper.appendChild(fok)
    ikonWrapper.appendChild(ikon)
    ikonWrapper.appendChild(leiras)
    balWrapper.appendChild(ikonWrapper)
    balWrapper.appendChild(hoerzet)

    jelenlegiJellWrapper.appendChild(varosWrapper)    
    jelenlegiJellWrapper.appendChild(minmaxWrapper)    

    jelenlegiDiv.appendChild(balWrapper)
    jelenlegiDiv.appendChild(jelenlegiJellWrapper)

    //napi jellemzők

    const jellemzokContainer = document.getElementById("idojaras_jellemzoi")
    jellemzokContainer.innerHTML = ""

    const jellemzok = [
        { nev: "Páratartalom", ertek: dailyWeather.main.humidity, egyseg: "%", icon: "/images/icons/paratartalom.svg" }, 
        { nev: "Szélsebesség", ertek: dailyWeather.wind.speed, egyseg: " km/h", icon: "/images/icons/szelsebesség.svg" },
        { nev: "UV Index", ertek: extraJellemzo.uv_index, egyseg: "", icon: "/images/icons/uv_index.svg" },
        { nev: "Légnyomás", ertek: dailyWeather.main.pressure, egyseg: " mb", icon: "/images/icons/legnyomas.svg" },
        { nev: "Látótávolság", ertek: dailyWeather.visibility/1000, egyseg: " km", icon: "/images/icons/latotavolsag.svg" },
        { nev: "Harmatpont", ertek: extraJellemzo.dew_point, egyseg: " °", icon: "/images/icons/harmatpont.svg" }
    ]

    const jellemzokWrapper = document.createElement("div");

    jellemzokWrapper.classList.add("grid", "grid-cols-2", "xl:grid-cols-3","gap-4");

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

    jellemzokContainer.appendChild(jellemzokWrapper)

    //nap jellemzők

    const napholdWrapper = document.createElement("div");
    napholdWrapper.classList.add("flex", "flex-col")

    const sunWrapper = document.createElement("div")
    sunWrapper.classList.add("bg-[#476D98]", "rounded-lg", "my-5")

    const sunDiv = document.createElement("div")
    sunDiv.classList.add("flex", "justify-center")

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 300 40");
    svg.setAttribute("class", "w-full h-25");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.id="sunriseSvg"

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M20,100 A130,130 0 0,1 280,100");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "#d7f0ff");
    path.setAttribute("stroke-width", "3");
    svg.setAttribute("class", "w-full max-w-115 h-45");
    path.id="sunArc"

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", "40");
    circle.setAttribute("cy", "30");
    circle.setAttribute("r", "15");
    circle.setAttribute("fill", "#F4C542");
    circle.id="sunMarker"

    svg.appendChild(path)
    svg.appendChild(circle)
    sunDiv.appendChild(svg)

    sunWrapper.appendChild(sunDiv)

    const kelteWrapper = document.createElement("div")
    const keltetext1 = document.createElement("p")
    const keltetext2 = document.createElement("p")

    keltetext1.textContent = `${new Date(dailyWeather.sys.sunrise * 1000).getHours()}:${new Date(dailyWeather.sys.sunrise * 1000).getMinutes()}`
    keltetext2.textContent = "Napkelte"
    kelteWrapper.appendChild(keltetext1)
    kelteWrapper.appendChild(keltetext2)

    const nyugtaWrapper = document.createElement("div")
    const nyugtatext1 = document.createElement("p")
    const nyugtatext2 = document.createElement("p")

    nyugtatext1.textContent = `${new Date(dailyWeather.sys.sunset * 1000).getHours()}:${new Date(dailyWeather.sys.sunset * 1000).getMinutes()}`
    nyugtatext2.textContent = "Napnyugta"
    nyugtaWrapper.appendChild(nyugtatext1)
    nyugtaWrapper.appendChild(nyugtatext2)

    const sunTextWrapper = document.createElement("div")

    sunTextWrapper.classList.add("flex", "justify-around", "text-center")

    sunTextWrapper.appendChild(kelteWrapper)
    sunTextWrapper.appendChild(nyugtaWrapper)
    sunWrapper.appendChild(sunTextWrapper)

    napholdWrapper.appendChild(sunWrapper)

    
    //hold jellemzők
    
    const holdWrapper = document.createElement("div")
    const holdKelteDiv = document.createElement("div")
    const holdNyugtaDiv = document.createElement("div")
    const holdFazisDiv = document.createElement("div")

    const holdKelteText1 = document.createElement("p")
    const holdKelteText2 = document.createElement("p")
    const holdNyugtaText1 = document.createElement("p")
    const holdNyugtaText2 = document.createElement("p")
    const fazisKep = document.createElement("img")
    const fazistText = document.createElement("p")

    holdWrapper.classList.add("flex", "justify-evenly", "items-center", "text-center", "bg-[#476D98]", "rounded-lg", "py-5")
    holdFazisDiv.classList.add("flex", "flex-col","items-center", "px-2")

    fazisKep.src = `./images/icons/${
        holdJellemzok.moonphase.toLowerCase().replace(/\s+/g, "-")
    }-moon.svg`;
    fazisKep.classList.add("w-25", "h-auto")

    holdKelteText1.textContent = holdJellemzok.moonrise
    holdKelteText2.textContent = "Holdkelte"
    holdNyugtaText1.textContent = holdJellemzok.moonset
    holdNyugtaText2.textContent = "Holdnyugta"
    fazistText.textContent = moonPhasesHU[holdJellemzok.moonphase]

    holdKelteDiv.appendChild(holdKelteText1)
    holdKelteDiv.appendChild(holdKelteText2)
    
    holdNyugtaDiv.appendChild(holdNyugtaText1)
    holdNyugtaDiv.appendChild(holdNyugtaText2)

    holdFazisDiv.appendChild(fazisKep)
    holdFazisDiv.appendChild(fazistText)
    
    holdWrapper.appendChild(holdNyugtaDiv)
    holdWrapper.appendChild(holdFazisDiv)
    holdWrapper.appendChild(holdKelteDiv)

    napholdWrapper.appendChild(holdWrapper)
    jellemzokContainer.appendChild(napholdWrapper)
    
    sunMove();
};

function sunMove () {
    const arc = document.getElementById('sunArc');
    const sun = document.getElementById('sunMarker');
    if (!arc || !sun) return;

    let sunriseTimestamp, sunsetTimestamp;
    const now = new Date().getTime();

    if (dailyWeather && dailyWeather.sys) {
        sunriseTimestamp = dailyWeather.sys.sunrise * 1000;
        sunsetTimestamp = dailyWeather.sys.sunset * 1000;
    } else {
        const d = new Date();
        sunriseTimestamp = new Date(d.setHours(6, 30, 0, 0)).getTime();
        sunsetTimestamp = new Date(d.setHours(17, 0, 0, 0)).getTime();
    }

    // Calculate progress (0 before sunrise, 1 after sunset)
    let progress;
    if (now <= sunriseTimestamp) {
        progress = 0;
    } else if (now >= sunsetTimestamp) {
        progress = 1;
    } else {
        progress = (now - sunriseTimestamp) / (sunsetTimestamp - sunriseTimestamp);
    }

    const L = arc.getTotalLength();
    const point = arc.getPointAtLength(progress * L);

    // Position sun circle (cx, cy) on the arc
    sun.setAttribute('cx', point.x);
    sun.setAttribute('cy', point.y);

    // Ensure the entire arc is visible by adjusting the SVG's viewBox dynamically
    const svg = document.getElementById('sunriseSvg');
    if (svg) {
        const padding = 20; // Add padding to ensure visibility
        const bbox = arc.getBBox();
        svg.setAttribute(
        'viewBox',
        `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + 2 * padding} ${bbox.height + 2 * padding}`
        );
    }
}

const getHourlyWeather = async () => {
    const weeklyWeather = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&lang=hu`
    );
    return weeklyWeather;
};

const renderHourlyWeahter = async () => {
    const data = await getHourlyWeather()
    hourlyWeather = await data.json();
    console.log(hourlyWeather);

    //óránkénti időjárás

    const orankenti = document.getElementById("orankenti_idojaras");
    orankenti.innerHTML = "";

    const swiper = document.createElement("div");
    const swiperwrapper = document.createElement("div");

    swiper.classList.add("swiper", "w-full", "!px-5", "!py-5", "bg-[#82B3DB]", "rounded-lg");
    swiperwrapper.classList.add("swiper-wrapper");
 
    orankenti.appendChild(swiper);
    swiper.appendChild(swiperwrapper)
 
    let id = 0;
 
    hourlyWeather.list.slice(0, 9).forEach( ora => {
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
        oraIkon.src = `images/icons/weather/${dailyWeather.weather[0].icon}.svg`;
        oraIkon.classList.add("min-w-8");
        oraLeiras.innerHTML = ora.weather[0].description.charAt(0).toUpperCase() + ora.weather[0].description.slice(1);
        oraLeiras.classList.add("text-xs");
        rawHourlyTemps.push(ora.main.temp);
        oraFok.innerHTML = hofok(ora.main.temp) + getUnitSymbol();

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
    napi.innerHTML = ""


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
        minekO.push(nap.main.temp_min);
        maxokO.push(nap.main.temp_max);


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


            const dayMinK = Math.min(...minekO);
            const dayMaxK = Math.max(...maxokO);
            minek.push(dayMinK);
            maxok.push(dayMaxK);
            rawDailyMin.push(dayMinK);
            rawDailyMax.push(dayMaxK);
            minekO = [];
            maxokO = [];
        }
    });

    const napDivWrapper = document.createElement("div");
    napi.appendChild(napDivWrapper);
    napDivWrapper.classList.add("flex", "flex-col", "lg:justify-evenly","rounded-lg","bg-[#82B3DB]", "h-[-webkit-fill-available]!");

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
        napEsoWrapper.classList.add("flex", "items-center","gap-1");
        napminmaxWrapper.classList.add("flex", "justify-end", "gap-3");
        napEsoIkon.classList.add("w-5");
        napEsoIkon.src = "images/icons/water-drop.svg";

        if (i == 0){
            napNev.innerHTML = "Ma";
        } else {
            napNev.innerHTML = napok[i].charAt(0).toUpperCase() + napok[i].slice(1);
        }
        napEso.innerHTML = Math.round(esok[i]) + "%";
        napIkon.src = `images/icons/weather/${dailyWeather.weather[0].icon}.svg`;
        napIkon.classList.add("mx-auto", "h-7")
        napMin.innerHTML = hofok(minek[i]) + getUnitSymbol();
        napMax.innerHTML = hofok(maxok[i]) + getUnitSymbol();


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
};

const changeUnit = (newUnit) => {
    unit = newUnit === "fahrenheit" ? "fahrenheit" : "celsius"; // only C/F

    const cOn = unit === "celsius";
    const fOn = unit === "fahrenheit";

    const cT = document.querySelector(".toggle-celsius");
    const fT = document.querySelector(".toggle-fahrenheit");

    cT && cT.classList.toggle("bg-[#476D98]", cOn);
    fT && fT.classList.toggle("bg-[#476D98]", fOn);

    // aktuális
    document.getElementById("jelenlegi_fok").innerHTML =
        hofok(dailyWeather.main.temp) + getUnitSymbol();

    document.getElementById("jelenlegi_hoerzet").innerHTML =
        "Hőérzet: " + hofok(dailyWeather.main.feels_like) + getUnitSymbol();

    document.getElementById("jelenlegi_minmax").innerHTML =
        hofok(dailyWeather.main.temp_min) + getUnitSymbol() +
        "/" +
        hofok(dailyWeather.main.temp_max) + getUnitSymbol();

    // óránkénti
    document.querySelectorAll(".swiper-slide .font-bold").forEach((el, i) => {
        el.innerHTML = hofok(rawHourlyTemps[i]) + getUnitSymbol();
    });

    // napi
    document.querySelectorAll("#napi_idojaras .flex.justify-end").forEach((el, i) => {
        if (!el || !el.children || el.children.length < 2) return;
        el.children[0].innerHTML = hofok(rawDailyMin[i]) + getUnitSymbol();
        el.children[1].innerHTML = hofok(rawDailyMax[i]) + getUnitSymbol();
    });
};

const getUnitSymbol = () => (unit === "fahrenheit" ? "°F" : "°C");

const hofok = (kelvin) => {
    if (typeof kelvin !== "number") return "";
    return unit === "fahrenheit"
        ? Math.round((kelvin - 273.15) * 9 / 5 + 32)
        : Math.round(kelvin - 273.15);
};

function getVitaminRecommendation(weatherData) {
    const { weather, temp, uvIndex } = weatherData;
    let vitamins = new Set();
    const w = weather ? weather.toLowerCase() : "";

    // Hőmérséklet alapú ajánlások
    if (temp < 10) {
        vitamins.add("C-vitamin");
        vitamins.add("D-vitamin");
        vitamins.add("Cink");
        vitamins.add("Omega-3"); // Téli depresszió ellen, bőr hidratálás
    } else if (temp > 25) {
        vitamins.add("Magnézium"); // Izzadás miatt
        vitamins.add("Kálium");
        vitamins.add("B-komplex"); // Energia
    }

    // Időjárás jelenség alapú
    if (w.includes("rain") || w.includes("drizzle") || w.includes("thunder")) {
        vitamins.add("C-vitamin");
        vitamins.add("E-vitamin"); // Bőr védelem
        vitamins.add("Cink");
    } else if (w.includes("snow")) {
        vitamins.add("D-vitamin");
        vitamins.add("C-vitamin");
        vitamins.add("Vas"); // Energiaszint
    } else if (w.includes("clear") || w.includes("sun")) {
        if (uvIndex > 5) {
            vitamins.add("E-vitamin"); // UV védelem
            vitamins.add("A-vitamin"); // Szem védelem
        }
    } else if (w.includes("cloud") || w.includes("fog") || w.includes("mist")) {
        vitamins.add("D-vitamin");
        vitamins.add("B-komplex"); // Hangulatjavítás
    }

    // UV Index alapú
    if (uvIndex < 3) {
        vitamins.add("D-vitamin");
    }

    // Alapértelmezett, ha nincs specifikus ajánlás
    if (vitamins.size === 0) {
        vitamins.add("C-vitamin");
        vitamins.add("Magnézium");
    }
  
    return Array.from(vitamins);
}

const vitaminAjanlo = (weather, temp, uvIndex) => {
    const ajanlottVitaminok = getVitaminRecommendation({ weather, temp, uvIndex });

    const vitaminAdatok = {
        "C-vitamin": { adag: "75-90mg", icon: "🍊" },
        "D-vitamin": { adag: "1500-2000IU", icon: "☀️" },
        "Magnézium": { adag: "300-400mg", icon: "🥑" },
        "Kálium": { adag: "3500-4700mg", icon: "🍌" },
        "Cink": { adag: "10-15mg", icon: "🥩" },
        "B-komplex": { adag: "1 tabletta", icon: "⚡" },
        "E-vitamin": { adag: "15mg", icon: "🌻" },
        "A-vitamin": { adag: "700-900µg", icon: "🥕" },
        "Omega-3": { adag: "250-500mg", icon: "🐟" },
        "Vas": { adag: "8-18mg", icon: "🥬" },
        "Kálcium": { adag: "1000mg", icon: "🥛" }
    };

    const vitaminContainer = document.getElementById("vitamin_ajanlo");
    vitaminContainer.innerHTML = ""; // Előző tartalom törlése
    
    const cim = document.createElement("h2")
    const vitaminWrapper = document.createElement("div");
    
    cim.textContent = "Vitamin ajánló"
    cim.classList.add("text-2xl", "sm:text-4xl", "text-center", "pb-5")
    vitaminWrapper.classList.add("text-center", "grid", "grid-cols-1", "sm:grid-cols-2", "gap-4", "lg:gap-10", "w-full");

    ajanlottVitaminok.forEach(nev => {
        const adat = vitaminAdatok[nev] || { adag: "N/A", icon: "💊" };
    
        const vitaminDiv = document.createElement("div");
        vitaminDiv.classList.add("bg-[#476D98]", "rounded-2xl", "p-4", "w-[85%]", "mx-auto", "flex", "justify-between", "items-center", "px-5");
    
        const nevWrapper = document.createElement("div");
        nevWrapper.classList.add("flex", "items-center", "gap-2");

        const iconSpan = document.createElement("span");
        iconSpan.textContent = adat.icon;
        iconSpan.classList.add("text-xl");

        const nevP = document.createElement("p");
        nevP.textContent = nev + ":";
        
        nevWrapper.appendChild(iconSpan);
        nevWrapper.appendChild(nevP);
    
        const adagP = document.createElement("p");
        adagP.classList.add("text-white", "font-bold");
        adagP.textContent = adat.adag + "/nap";
    
        vitaminDiv.appendChild(nevWrapper)
        vitaminDiv.appendChild(adagP)

        vitaminWrapper.appendChild(vitaminDiv)
    });

    vitaminContainer.appendChild(cim)
    vitaminContainer.appendChild(vitaminWrapper)
}

renderAutomatic()
setInterval(sunMove, 60000);
sunMove();