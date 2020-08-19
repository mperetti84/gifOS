// get userMedia handler
const getStream = () => {
    let getStream = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { 
            width: 720,
            height: 480  
        }
    }).catch(err => {
        alert("gifOS quiere acceder a la camara: " + err.message);
    })
    return getStream;
}

// show video capture
const showCapture = async () => {
    // display/hide elements accordingly
    showCaptureSect();
    // clear capture time global variable
    clearExec(); 

    // get stream handler
    stream = await getStream();
    video.srcObject = stream;
    video.play();
    console.log("Mostrando camara");
    // configure recorder objects
    gifRecorder = RecordRTC(stream, {
        type: 'gif',
        frameRate: 1,
        quality: 10,
        width: 360,
        hidden: 240,
        onGifRecordingStarted: function() {
            // once gif capture starts start time count and initiate duration counter
            initCaptureCount();
            videoDuration = 0;
            console.log('Capturando gif');
         },
        onGifPreview: function() {
            video.play();
        }
    });
    videoRecorder = RecordRTC(stream, {
        disableLogs: true,
        type: "video",
        mimeType: "video/webm",
        frameRate: 1,
        quality: 10,
        width: 720,
        hidden: 480
    });
}

// start recording gif
const captureGif = async () => {
    // display/hide elements accordingly
    showCapturingGif();
    // set both recorder elements to initial state
    gifRecorder.reset();
    videoRecorder.reset();

    // call start function of both recorder onjects
    gifRecorder.startRecording();
    gifRecorder.camera = stream;
    videoRecorder.startRecording();
    videoRecorder.camera = stream;
}


// stop recording and show gif
const showGif = () => {
    // pause timer count
    stopTime();
    video.srcObject = null;

    gifRecorder.stopRecording(function() {
        // get gif blob file
        newBlob = gifRecorder.getBlob();

        // display/hide elements accordingly
        showPreviewGif();

        // empty replay progress bar
        changeProgress("replay_bar",0);

        // stop acces to the media and destroy handler
        gifRecorder.camera.stop();
        gifRecorder.destroy();
        gifRecorder = null;

    });

    videoRecorder.stopRecording(function() {
        console.log("Duracion de video en ms: " + videoDuration);
        //get video blob file
        videoBlob = videoRecorder.getBlob();
        video.src = URL.createObjectURL(videoBlob);
        console.log(video.duration);

        // stop acces to the media and destroy handler
        videoRecorder.camera.stop();
        videoRecorder.destroy();
        videoRecorder = null;
    });
}

// preview recorded gif as a video
const playCapturedVideo = () => {
    if(video.paused){
        console.log("reproducir video grabado");
        video.play();
        animateProgress();
    }
}

// create form with new gif in blob file and upload it to giphy
const uploadGif = () => {
    // display/hide elements accordingly
    showUploadGif();
    
    // create and define new form data with fetch keys
    let form = new FormData();
    form.append('file', newBlob, 'manoloperetti.gif');
    form.append('api_key', giphyAPIvars.api_key);
    form.append('tags', "manuperetti, manoloperetti");
    console.log(form.get('file'));

    // create fetch configuration
    let fetchConfig =  {
        body: form,
        signal: signal, // add upload-abort signal to configuration form
        method: 'POST'
    };

    // animate upload bar, reset it and then animate for 15 seconds
    changeProgress("upload_progress",0);    
    changeProgress("upload_progress",100, 1500);


    fetch("https://upload.giphy.com/v1/gifs", fetchConfig)
        .then(response => {
            if(response.ok) {
                console.log("subido ok");
                return response.json();
            } else {
                console.log("error al subir");
                throw new Error("Error en la llamada Ajax");
            }
        }).then( data => {
            createGifoURL(data.data.id);
            console.log("Respuesta de giphy:");
            console.log(data);
        }).catch(err => {
            // once upload cancelled by user, reset abort controller
            resetAbortCtrl();
            // on upload cancel go back to create gif indications section
            showCreateSect();
            console.log(err.message);
        })
}

// fetch last created gif using response id and get gif URL from it
const createGifoURL = (id) => {
    let fetchURL = "https://api.giphy.com/v1/gifs/" + id + "?api_key=" + giphyAPIvars.api_key;
    fetch(fetchURL)
        .then(response => {
            return response.json();
        }).then(data => {
            // define url to assign to clipboard
            newUrl = data.data.images.downsized.url;
            console.log(newUrl);
            console.log(data);

            // add new gifo url to local storage gifos list
            localStrgAddElement("gifos", newUrl);

            // display post upload options elements
            showPostUploadGif();
        })
}

// Copy gifo url to clipboard
const gifUrlToClipboard = () => {
    // create textarea and assign new gifo url
    const urlHolder = document.createElement('textarea');
    urlHolder.value = newUrl;

    // avoid user from editing the element and hide outside main view
    urlHolder.setAttribute('readonly', '');
    urlHolder.style.position = 'absolute';
    urlHolder.style.left = '-9999px';

    // append holder to body to be able to select and copy it
    document.body.appendChild(urlHolder);
    urlHolder.select();
    document.execCommand('copy');

    // instantly remove holder from body
    document.body.removeChild(urlHolder);
  };

// Fetch gif url, get blob url and assign it to button href
const gifoDownload = async () => {
    // fetch new gif url and get url from blob
    let fetchedGif = fetch(newUrl);
    let blobDownload = (await fetchedGif).blob();
    let downloadUrl = URL.createObjectURL(await blobDownload);

    // create temporal anchor and configure it
    let downloadLink = document.createElement('a');
    downloadLink.href = downloadUrl;
    downloadLink.style.display = "none";
    downloadLink.download = 'downoladed_gifo.gif'; 

    // execute click action and delete temporal anchor
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
