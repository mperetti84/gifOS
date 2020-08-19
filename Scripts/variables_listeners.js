// Global variables
let gifRecorder;
let videoRecorder;
let newBlob;
let videoBlob;
let videoDuration;
let video = document.getElementById("video_cont");
let runClock;
let stream;
let addHistoryBtn = true;   // flag that determines if a search is added to the search history list
let currentTime;
let clockRun = false;
let newUrl;
let currentSugestion;
let maxGifDuration = 10;    // limit gif duration to 10 seconds
// Global constants
const giphyAPIvars = {
    responseLimit : 20,
    trendsLimit : 32,
    suggestLimit : 4,
    historyLimit : 10,
    autoCompleteLimit : 3,
    api_key : 'lFJGdYnY53vyJ2i8Rv4EFw4twh3iEG20'
}

// Handle gifo upload cancellation
let controller;
let signal;

document.getElementById("cancel_upload_btn").addEventListener("click", () =>{
    controller.abort();
    console.log("Subida de gifo cancelada")
});

// capture section event listeners
document.getElementById("create_gif_but").addEventListener("click", showCreateSect);
document.getElementById("my_gifos_link").addEventListener("click", showMyGifs);
document.getElementById("start_btn").addEventListener("click", showCapture);
document.getElementById("repeat_capture_btn").addEventListener("click", showCapture);
document.getElementById("start_capture_btn_cont").addEventListener("click", captureGif);
document.getElementById("stop_btn_cont").addEventListener("click", showGif);
document.getElementById("upload_capture_btn").addEventListener("click", uploadGif);
document.getElementById("post_upload_ready_btn").addEventListener("click", showCreateSect);
document.getElementById("gifo_play_btn").addEventListener("click", playCapturedVideo);
document.getElementById("copy_gif_url").addEventListener("click", gifUrlToClipboard);
document.getElementById("download_gif").addEventListener("click", gifoDownload);

// Search button event listener with anonymus function
document.getElementById("search_but").addEventListener("click", function(){searchToImages(document.getElementById('search_input').value)});
document.getElementById("search_li_1").addEventListener("click", function(){searchToImages(document.getElementById('search_result1').innerText)});
document.getElementById("search_li_2").addEventListener("click", function(){searchToImages(document.getElementById('search_result2').innerText)});
document.getElementById("search_li_3").addEventListener("click", function(){searchToImages(document.getElementById('search_result3').innerText)});
// document.getElementById("show_more_1").addEventListener("click", function(){searchToImages(currentSugestion)});
// document.getElementById("show_more_2").addEventListener("click", function(){searchToImages(currentSugestion)});
// document.getElementById("show_more_3").addEventListener("click", function(){searchToImages(currentSugestion)});
// document.getElementById("show_more_4").addEventListener("click", function(){searchToImages(currentSugestion)});

// load home page when logo is clicked
const homePageLoad = () => {
    window.location = '/';   
}
document.getElementById("logo_anchor").addEventListener("click", homePageLoad);
document.getElementById("back_arrow").addEventListener("click", homePageLoad);
document.getElementById("cancel_btn").addEventListener("click", homePageLoad);

// Call autoucomplete when writing search input
document.getElementById("search_input").addEventListener("input", autoComplete);

// change theme events
document.getElementById("theme_day").addEventListener("click", () => { changeTheme("day");});
document.getElementById("theme_night").addEventListener("click", () => { changeTheme("night");});

// Show/hide theme list display and search suggestions list
window.addEventListener("click", event => { 
    displayOnClick(event.target);
});

