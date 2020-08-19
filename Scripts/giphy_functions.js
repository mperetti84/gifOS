// Search Gifs Function
function gifsSearch(searchIn){
    let searchFetchParam = 'https://api.giphy.com/v1/gifs/search?limit=' + giphyAPIvars.responseLimit + '&api_key=' + giphyAPIvars.api_key + '&q=' + searchIn;
    console.log("Search button pressed: " + searchFetchParam);
    const fetchResult = fetch(searchFetchParam);
    return fetchResult;
}

// Search-to-images function
function searchToImages(search){
    // hide list and list container, erase last search
    document.getElementById("suggestions_sect").style.display = "none";
    document.getElementById("search_results_cont").style.display = "none";
    document.getElementById("search_result_list").style.display = "none";
    document.getElementById("search_input").value = "";
    let imgGlobalCont = document.getElementById("trends_img_global_cont");
    imgGlobalCont.innerHTML = "";
    //replace blank spaceces with "+""
    let searchOut = search.replace(/\s/g,'+');     
    const searchResult = gifsSearch(searchOut);  
    searchResult
        .then((response) => {
            return response.json()
        }).then(result => {
            // for each search result element: create new img and new div for each image, append each img div to global container
            let resultText = document.getElementById("trends_text");
            for(let i = 0; i < result.data.length; i++){
                let newImg = document.createElement("div");
                newImg.style.backgroundImage = "url(" + result.data[i].images.fixed_height.url + ")";
                newImg.setAttribute("class", "trend_img");
                imgGlobalCont.appendChild(newImg);
            }
            resultText.innerText = search + " (Resultados)";
            // add search to localstrg search list (don't add when search is called from search history button)
            if(addHistoryBtn){
                localStrgAddElement("search",search);
            } else{
                addHistoryBtn = true;
            }
        }).catch(error => {
            console.log("Couldn't fetch search content: ", error.message);
    })
} 

// search autocomplete function
const autoComplete = () => {
    let input = document.getElementById("search_input");
    let inputNoBlank = input.value.replace(/\s/g,'+');    //replace blank spaces with "+"
    let instantResponse = document.getElementsByClassName("search_result");
    let respCont = document.getElementById("search_results_cont");
    let respContList = document.getElementById("search_result_list");
    let searchCont = document.getElementById("search_cont");
    // define search suggestion container width to match search section current width
    respCont.style.width = window.getComputedStyle(searchCont, null).getPropertyValue("width");
    console.log(respCont);
    console.log(input.value);
    let fetchParameter = 'https://api.giphy.com/v1/gifs/search/tags?limit=' + giphyAPIvars.autoCompleteLimit + '&api_key=' + giphyAPIvars.api_key + '&q=' + inputNoBlank;
    fetch(fetchParameter)
    .then(resp => {
        return resp.json()
    }).then(data => {
        console.log(data);
        // Display search results list and list container
        respContList.style.display = "flex";
        respCont.style.display = "flex";
        // Define how many valid responses were obtained from fetch. NonValidResp is the difference between the amount of responses expected and gotten.
        validResp = data.data.length;
        nonValidResp = giphyAPIvars.autoCompleteLimit - data.data.length;
        // Replace text on anchors with valid responses
        for(let i = 0; i < validResp; i++){
            instantResponse[i].innerText = data.data[i].name;
        }
        // Fill the remaining anchors with blank (only if response array has less elements than expected)
        for(let i = 0; i < nonValidResp; i++){
            instantResponse[validResp + i].innerText = "";
        }
        // Hide list when search is erased
        if( validResp === 0){
            respContList.style.display = "none";
            respCont.style.display = "none";
            instantResponse[0].innerText = "";
            instantResponse[1].innerText = "";
            instantResponse[2].innerText = "";
        }
    }).catch(err => {
        respContList.style.display = "none";
        respCont.style.display = "none";
        instantResponse[0].innerText = "";
        instantResponse[1].innerText = "";
        instantResponse[2].innerText = ""
    });
}

// Trends-to-images function
const getTrends = () =>{
    let trendsFetchParam = 'https://api.giphy.com/v1/gifs/trending?limit=' + giphyAPIvars.trendsLimit + '&api_key=' + giphyAPIvars.api_key;
    console.log("New trends loaded: " + trendsFetchParam);
    let imgGlobalCont = document.getElementById("trends_img_global_cont");
    fetch(trendsFetchParam)
    .then((response) => {
        return response.json()
    }).then(result => {
        getSuggestions();
        console.log("Tendencias: ");
        console.log(result);
        // for each trends result element: create new img element, append new img to global container
        for(let i = 0; i < result.data.length; i++){
            let newImg = document.createElement("div");
            newImg.style.backgroundImage = "url(" + result.data[i].images.fixed_height.url + ")";
            // add title to image that will be shown on hover
            newImg.innerHTML = `
                <div class="global_div_top trend_title_cont" id="trend_title_cont">
                    <p class="div_title trend_title" id="trend_title"></p>
                </div>
            `;
            newImg.setAttribute("class", "trend_img");
            imgGlobalCont.appendChild(newImg);
            let newImgTitle = document.getElementsByClassName("trend_title");
            newImgTitle[i].innerText = "#"+result.data[i].title.slice(0,23).replace(/\s/g,'#');
        }
    }).catch(error => {
        console.log("Couldn't fetch trends content: ", error.message);
    })
}

// get suggestions: randomly select a topic, search gifs on that topic and randomly select four gifs to show as suggestions
const getSuggestions = () =>{
    let randomSuggestion = ["pearl jam", "rick and morty", "simpsons", "bojack", "radiohead", "programming", "homer", "tarantino", "software development", "red hot chili peppers"];
    let randomIndex = parseInt((Math.random() % 1) * randomSuggestion.length);
    console.log("index: " + randomIndex);
    let suggestionPicked = randomSuggestion[randomIndex];
    let fetchQuery = suggestionPicked.replace(/\s/g,'+');
    console.log(fetchQuery);
    let suggestConts = document.getElementsByClassName("suggest_img");
    let suggestTitles = document.getElementsByClassName("suggestion_title");
    console.log(suggestConts);
    console.log("New suggestions loaded: " + fetchQuery);
    currentSugestion = suggestionPicked;
    gifsSearch(fetchQuery)
        .then((response) => {
            return response.json();
        }).then(result => {
            console.log("suggestions: ");
            console.log(result);
            for(let i = 0; i < giphyAPIvars.suggestLimit; i++){
                let randomGif = parseInt((Math.random() % 1) * result.data.length);
                suggestConts[i].style.backgroundImage = "url(" + result.data[randomGif].images.fixed_height.url + ")";
                let titleNoBlank = result.data[randomGif].title.slice(0,25).replace(/\s/g,'');
                suggestTitles[i].innerText = "#" + titleNoBlank;
            }
        }).catch(err => {
            console.log("Could not fetch random gif: " + err);
        })
}