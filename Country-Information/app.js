document.querySelector("#btnSearch").addEventListener("click", () => {  //Search button operations
    let text = document.querySelector("#txtSearch").value;
    document.querySelector("#details").style.opacity = 0;
    document.querySelector("#loading").style.display = "block";
    getCountry(text);
});

document.querySelector("#btnLocation").addEventListener("click", () => { //Async function that finds which country you are from your location
    if(navigator.geolocation) {
        document.querySelector("#loading").style.display = "block";
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    }
});

function onError(err) {  //For catch the navigation errors
    console.log(err);
    document.querySelector("#loading").style.display = "none"; 
}

async function onSuccess(position) {  //Function that does what to do when you don't get an error about location
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;

    // api, google, opencagedata
    const api_key = "<api_anahtar_bilginiz_gelecek>"; //opencagedata key value.
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${api_key}`;

    const response = await fetch(url);
    const data = await response.json();

    const country = data.results[0].components.country;

    document.querySelector("#txtSearch").value = country;
    document.querySelector("#btnSearch").click();        
}

async function getCountry(country) { //Function that checks whether the country is found in the search result
    try {
        const response = await fetch('https://restcountries.com/v3.1/name/' + country);
        if(!response.ok) //If the search result doesn't return OK, we know that there is no country.
            throw new Error("ülke bulunamadı");
        const data = await response.json();
        renderCountry(data[0]);

        const countries = data[0].borders;
        if(!countries) //If we cannot find the country and the border country as a result of the search, we understand that the border country does not exist.
            throw new Error("Neighboring country not found.");

        const response2 = await fetch('https://restcountries.com/v3.1/alpha?codes=' + countries.toString());
        const neighbors = await response2.json();

        renderNeighbors(neighbors);
    }
    catch(err) {
        renderError(err);
    }
}

function renderCountry(data) {  //Function that displays the country's information, if there is one
    document.querySelector("#loading").style.display = "none";
    document.querySelector("#country-details").innerHTML = "";
    document.querySelector("#neighbors").innerHTML = "";
   
    let html = `                   
            <div class="col-4">
                <img src="${data.flags.png}" alt="" class="img-fluid">
            </div>
            <div class="col-8">
                <h3 class="card-title">${data.name.common}</h3>
                <hr>
                <div class="row">
                    <div class="col-6">Nufüs: </div>
                    <div class="col-6">${(data.population / 1000000).toFixed(1)} milyon</div>
                </div>
                <div class="row">
                    <div class="col-6">Resmi Dil: </div>
                    <div class="col-6">${Object.values(data.languages)}</div>
                </div>
                <div class="row">
                    <div class="col-6">Başkent: </div>
                    <div class="col-6">${data.capital[0]}</div>
                </div>
                <div class="row">
                    <div class="col-6">Para Birimi: </div>
                    <div class="col-6">${Object.values(data.currencies)[0].name} (${Object.values(data.currencies)[0].symbol})</div>
                </div>
            </div>
    `;            

    document.querySelector("#details").style.opacity = 1; 
    document.querySelector("#country-details").innerHTML = html;       
}
 
function neighbourCountry(countryName) {   //Function that searches for neighboring countries when you click on them
    document.querySelector("#txtSearch").value = countryName;
    let text = document.querySelector("#txtSearch").value;
    document.querySelector("#details").style.opacity = 0;
    document.querySelector("#loading").style.display = "block";
    getCountry(text);
}



function renderNeighbors(data) {  //Function that brings neighboring countries
    let html = "";
    for (let country of data) {
        html += `
            <div onclick="neighbourCountry('${country.name.common}')" class="col-2 mt-2">
                <div class="card">
                    <img src="${country.flags.png}" class="card-img-top img-fluid">
                    <div class="card-body">
                        <h6 class="card-title">${country.name.common}</h6>
                    </div>
                </div>
            </div>`;
    }

    document.querySelector("#neighbors").innerHTML = html;
}




function renderError(err) {     //Function that displays a red error message for 3 seconds above the search field if the search is unsuccessful.
    document.querySelector("#loading").style.display = "none";
    const html = `
        <div class="alert alert-danger">
            ${err.message}
        </div>
    `;
    setTimeout(function() {
        document.querySelector("#errors").innerHTML = "";
    }, 3000);
    document.querySelector("#errors").innerHTML = html;
}


async function searchCountry(searchText) {  //Search algorithm
    try {
        const response = await fetch('https://restcountries.com/v3.1/name/' + searchText);
        if (!response.ok)
            throw new Error("Country not found");
        const data = await response.json();
        const searchList = document.querySelector("#searchList");
        let html = "";


       const items = data.slice(0, 5); // take first 5
        for (let country of items) {
            html += `<li class="item">${country.name.common}</li>`;
        }

        searchList.innerHTML = html;

        // Add click event to li elements
        const searchItems = searchList.querySelectorAll('.item');
        searchItems.forEach(item => {
            item.addEventListener('click', () => {
                document.querySelector("#txtSearch").value = item.textContent;
                document.querySelector("#btnSearch").click();
                searchList.innerHTML = '';   //clear search results
            });
        });
    } catch (err) {
        console.error(err);
    }
}

const txtSearch = document.querySelector("#txtSearch");
txtSearch.addEventListener('input', () => {
    const searchText = txtSearch.value.trim();
    if (searchText.length > 0) {
        searchCountry(searchText);
    }
});
