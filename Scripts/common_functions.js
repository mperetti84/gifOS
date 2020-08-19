// run these functions once DOM is fully loaded
window.onload = () => {
    // get previous theme configuration from localstorage and apply as main style
    let previousTheme = window.localStorage.getItem("theme");
    if (previousTheme === "./Styles/dark_styles.css"){
        changeTheme("night");
    } else {
        changeTheme("day");
    }
    // set initial abort controller
    resetAbortCtrl();
    // get search history from local storage and show them as buttons
    showSearchHistory();
    // get trends from giphy site
    getTrends();
}

// Theme selection function
function changeTheme(theme) {
    // let previousTheme = window.localStorage.getItem("theme");
    let themeLink = document.getElementById("themeStyle");
    let currentTheme = themeLink.getAttribute("href");
    // console.log("tema en localstorage: " + previousTheme);
    if (theme === "day" & currentTheme === "./Styles/dark_styles.css"){
        window.localStorage.setItem("theme", "./Styles/light_styles.css");
        themeLink.setAttribute("href", "./Styles/light_styles.css");
    } else if (theme === "night" & currentTheme === "./Styles/light_styles.css"){
        window.localStorage.setItem("theme", "./Styles/dark_styles.css");
        themeLink.setAttribute("href", "./Styles/dark_styles.css");
    }
    
    console.log("tema pedido: " + theme);
    console.log("tema actual: " + currentTheme);
}

// Function that shows/hide theme options list, hides search suggestions and erases search input
const displayOnClick = (target) =>{
    // show/hide theme list
    let themeList = document.getElementById("theme_list_cont");
    console.log("id: " + target.id);
    console.log("display: " + themeList.style.display);
    // If list is shown hide, if it is not shown, show only when theme button is clicked
    if ((target.id === "choose_theme_btn1" | target.id === "choose_theme_btn2") & themeList.style.display === "flex"){
        themeList.style.display = "none";
    } else if ((target.id === "choose_theme_btn1" | target.id === "choose_theme_btn2") & themeList.style.display !== "flex"){
        themeList.style.display = "flex";
    } else{
        themeList.style.display = "none";
    }

    //erase search text if clicked outside search input area
    let searchInput = document.getElementById("search_input");
    let searchRespCont = document.getElementById("search_results_cont");
    if (target.id !== "search_input" & searchInput.value !== ""){
        searchInput.value = "";
        searchRespCont.style.display = "none";
    }

    // search gifos using only search history button text
    if ((target.className === "search_history_btn") & target.className !== "search_result regular_text" & target.id !== "search_but"){
        addHistoryBtn = false;
        console.log("se busca por boton de historial")
        let btnText = target.innerText.replace('#','');    //replace # with ""
        searchToImages(btnText);
    }

    if (target.className === "blue_but show_more_sug"){
        addHistoryBtn = false;
        searchToImages(currentSugestion);
    }
}

// Show gifos from local storage gifos list
const showMyGifs = async () => {
    document.getElementById("suggestions_sect").style.display = "none";
    document.getElementById("search_sect").style.display = "none";
    document.getElementById("trends_sect").style.display = "flex";
    // delete childs from global container
    document.getElementById("trends_text").innerText = "Mis guifos";
    let imgGlobalCont = document.getElementById("trends_img_global_cont");
    imgGlobalCont.innerHTML = "";
    // get gifos list and append as img to global container
    let gifosList = [];
    let gifosListJson;
    gifosListJson = localStorage.getItem("gifosList");
    if ( gifosListJson !== null){
        gifosList = await JSON.parse(gifosListJson);
        console.log(gifosList);
        for(let i = 0; i < gifosList.length; i++){
            console.log(gifosList[i]);
            let newImg = document.createElement("div");
            newImg.style.backgroundImage = "url(" + gifosList[i] + ")";
            newImg.setAttribute("class", "trend_img");
            imgGlobalCont.appendChild(newImg);
        }
    }
}

// create and show search-history buttons after getting history from local storage
const showSearchHistory = async () => {
    let searchList = [];
    let searchListJson;
    let historyBtnsCont = document.getElementById("search_history_cont");
    let btnAmount;
    // clear actual button container
    historyBtnsCont.innerHTML = "";
    historyBtnsCont.style.display = "flex";
    searchListJson = localStorage.getItem("searchList");
    if ( searchListJson !== null){
        searchList = await JSON.parse(searchListJson);
        // show no more than 10 buttons
        if(searchList.length <= 10){
            btnAmount = searchList.length;
        } else{
            btnAmount = giphyAPIvars.historyLimit;
        }
        // create new button for each element (or 10 as max) in history array and append them to global container
        for(let i = 0; i < btnAmount; i++){
            let newBtn = document.createElement("button");
            console.log(searchList[i]);
            newBtn.setAttribute("class", "search_history_btn");
            newBtn.innerText = "#" + searchList[i];
            historyBtnsCont.appendChild(newBtn);
        }
    }
}

// add elements to local storage arrays (type: "search", "gifos"; text: "search text", "gifo url")
const localStrgAddElement = async (storageType, storageText) => {
    let searchList = [];
    let searchListJson;
    let gifosList = [];
    let gifosListJson;
    switch(storageType){
        case "search": 
            searchListJson = localStorage.getItem("searchList");
            if ( searchListJson !== null){
                searchList = await JSON.parse(searchListJson);
                searchList.unshift(storageText);
                searchListJson = JSON.stringify(searchList);
                localStorage.setItem("searchList", searchListJson);
            } else {
                searchList.unshift(storageText);
                searchListJson = JSON.stringify(searchList);
                localStorage.setItem("searchList", searchListJson);
            }
            // call create-and-show search history buttons function
            showSearchHistory();
            break;
        case "gifos": 
            gifosListJson = localStorage.getItem("gifosList");
            if ( gifosListJson !== null){
                gifosList = await JSON.parse(gifosListJson);
                gifosList.unshift(storageText);
                gifosListJson = JSON.stringify(gifosList);
                localStorage.setItem("gifosList", gifosListJson);
            } else {
                gifosList.unshift(storageText);
                gifosListJson = JSON.stringify(gifosList);
                localStorage.setItem("gifosList", gifosListJson);
            }
            console.log(gifosList);
            // show all gifos once new one is added into list
            showMyGifs();
            break;
        default:
            break;
    }
}

// stablish actual time to be used in capture duration calculation
const initCaptureCount = () => {
    currentTime = new Date();
    clockRun = true
    console.log(currentTime);
    startTime();
}

const stopTime = () => {
    clockRun = false;
}

const clearExec = () => {
    document.getElementById('record_counter').innerText="00:00:00:00";
}

const startTime = () => {
    let today = new Date();
    // duration is curren time minus initial time
    let h = today.getHours() - currentTime.getHours();
    let m = today.getMinutes() - currentTime.getMinutes();
    let s = today.getSeconds() - currentTime.getSeconds();
    // get only 2 digits of millisecond value
    let mi= Math.round(today.getMilliseconds() / 10); 
    
    // add padding zeroes if value is less than 10
    h = checkTime(h);
    m = checkTime(m);
    s = checkTime(s);
    mi = checkTime(mi);
    // update time in counter
    document.getElementById('record_counter').innerText = h + ":" + m + ":" + s + ":" + mi;

    // limit gif duration    
    if (s >= maxGifDuration){
        showGif();
    }

    // call itself while clock run
    if (clockRun){
        setTimeout(startTime,100);
    }else{
        // time in displayed counter to ms
        videoDuration = (s * 1000) + (mi * 10);
    } 
}

const checkTime = (i) => {
    if (i<10)
    {
    i="0" + i;
    }
    return i;
}

// set/reset abort controller function
const resetAbortCtrl = () => {
    controller = new AbortController();
    signal = controller.signal;
}

// Display create section and hide all elements that are not needed
const showCreateSect = () => {
    document.getElementById("create_choose_mygifs").style.display = "none";
    document.getElementById("suggestions_sect").style.display = "none";
    document.getElementById("search_sect").style.display = "none";
    document.getElementById("trends_sect").style.display = "none";
    document.getElementById("create_gif_cont").style.display = "flex";
    document.getElementById("capture_sect").style.display = "flex";
    document.getElementById("back_arrow").style.visibility = "visible";
    document.getElementById("upload_success_global_cont").style.display = "none";
    document.getElementById("cancel_upload_btn_cont").style.display = "none";
    document.getElementById("video_capture_cont").style.display = "none";
}

// Display capture section and hide all elements that are not needed
const showCaptureSect = () => {
    // display/hide elements accordingly
    document.getElementById("create_gif_cont").style.display = "none";
    document.getElementById("uploading_gif_msg").style.display = "none";
    document.getElementById("video_capture_cont").style.display = "flex";
    document.getElementById("video_cont").style.display = "flex";
    document.getElementById("start_capture_btn_cont").style.display = "flex";
    document.getElementById("stop_capture_btn_cont").style.display = "none";
    document.getElementById("trends_sect").style.display = "none";
    document.getElementById("upload_gif_btn_cont").style.display = "none";
    document.getElementById("capture_cont_title_text").innerText = "Un Chequeo Antes de Empezar";
}

// Display capturing gif options and hide all elements that are not needed
const showCapturingGif = () => {
    // display/hide elements accordingly
    document.getElementById("capture_cont_title_text").innerText = "Capturando Tu Guifo";
    document.getElementById("start_capture_btn_cont").style.display = "none";
    document.getElementById("stop_capture_btn_cont").style.display = "flex";
    document.getElementById("stop_btn_cont").style.display = "flex";
}

// Display gif preview elements and hide all elements that are not needed
const showPreviewGif = () => {
    // display/hide elements accordingly
    document.getElementById("upload_gif_btn_cont").style.display = "flex";
    document.getElementById("stop_btn_cont").style.display = "none";
    document.getElementById("capture_cont_title_text").innerText = "Vista Previa";
}

// Display upload gif elements and hide all elements that are not needed
const showUploadGif = () => {
    // display/hide elements accordingly
    document.getElementById("video_cont").style.display = "none";
    document.getElementById("uploading_gif_msg").style.display = "flex";
    document.getElementById("capture_cont_title_text").innerText = "Subiendo tu gifo";
    document.getElementById("stop_capture_btn_cont").style.display = "none";
    document.getElementById("cancel_upload_btn_cont").style.display = "flex";
}

// Display post upload gif options and hide all elements that are not needed
const showPostUploadGif = () => {
    // display/hide elements accordingly
    document.getElementById("upload_success_global_cont").style.display = "flex";
    document.getElementById("video_capture_cont").style.display = "none";
    document.getElementById("post_upload_gif").src = newUrl;
}

// animate progress bar function
const animateProgress = () => {
    // reset progress bar
    changeProgress("replay_bar",0);
    // step is 10% of video duration
    let stepTime = videoDuration / 10;
    // start bar animation
    changeProgress("replay_bar",100, stepTime);
}


const changeProgress = (progressBarId, progressValue, animDurPerStep = 0) => {
    let progressBar = document.getElementById(progressBarId);
    console.log(progressBar);
    let oldProgressValue = -parseInt(
      window.getComputedStyle(progressBar).getPropertyValue("background-position")
    );
    console.log(oldProgressValue);
    if (progressValue > 100){
        progressValue = 100;
    }else if (progressValue < 0){
        progressValue = 0;
    }else{
        progressValue = Math.round(progressValue / 10) * 10;
    }
  
    let steps = Math.abs(oldProgressValue - progressValue) / 10;
    let totalAnimDur = animDurPerStep * steps;
  
    progressBar.style.transition = totalAnimDur + "ms steps(" + steps + ")";
    progressBar.style.backgroundPosition = -progressValue + "%";
}
