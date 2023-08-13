
var priorUrl="//";
var currentTab;
var startTime;
var sendReceive;
var elapsedTime=0;
var elapsedPreviousTime;
var myWindowId;
var contentToStore = {};
var total = 0;
var stopwatchInterval; // to keep track of the interval 
var elapsedPausedTime;


startTimer();

function saveElapsed() {
    let new_url;
    chrome.tabs.query({
         active: true,
         currentWindow: true
    }).then(tabs => {
        new_url = tabs[0].url;
        let localPrior = currentTab;
        
        if (typeof localPrior !== "undefined" && localPrior !== new_url ) {
            contentToStore[`ElapsedTime${currentTab}`] = elapsedTime;
            chrome.storage.local.set(contentToStore);
            let priorElapsedTime = elapsedTime;
            stopStopwatch();
            resetStopwatch();
            
            
            elapsedTime= 0;
            chrome.storage.local.get(`ElapsedTime${new_url}`).then((storedInfo) => {
                
                elapsedPreviousTime = storedInfo[Object.keys(storedInfo)[0]];
                if(typeof elapsedPreviousTime === "undefined")
                {
                    elapsedPreviousTime=0;
                }
            });
            let lastPathArray = localPrior.split('/');
            let lastHost = lastPathArray[2];
           
            //priorUrl = new_url;
            
            currentTab = new_url;
            //Retrieve elapsed time spent on website based on existing keys
            let pathArray = currentTab.split('/');
            
            let protocol = pathArray[0];
            let host = pathArray[2];
            let url = protocol + '//' + host;
            
            
            //total = 0;
            let tempTotal = 0;

            chrome.storage.local.get().then((storedInfo) => {
                Object.keys(storedInfo).forEach((key) => {
                    if (key.startsWith(`ElapsedTime${url}`) && key !== `ElapsedTime${currentTab}`) {
                        tempTotal += storedInfo[key];
                    }
                });
            total = tempTotal;
            startTime = new Date().getTime() - elapsedPreviousTime;
            startTimer();

            });
            
        }
    });
}

function startTimer() {
    
    //User has navigated to a new or previously visited site. Update prior Url of active window and start timer.
     try {
     chrome.tabs.query({
         currentWindow: true , active: true
     }).then((tabs) => {
         currentTab = tabs[0].url;
     });
     } catch (error) {
        
        console.log(error);
     }
     
    currentTime = new Date().getTime();
    startTime = currentTime;
    if(typeof elapsedPreviousTime === "undefined") {
        
        elapsedPreviousTime = 0;
        
    }
    elapsedPausedTime = 0;
    
    
    if (!stopwatchInterval) {
        startTime = new Date().getTime() - (elapsedPreviousTime + elapsedPausedTime); // get the starting time by subtracting the elapsed paused time from the current time
        stopwatchInterval = setInterval(updateStopwatch, 100); // update every second
    }
    
}

function stopStopwatch() {
    clearInterval(stopwatchInterval); // stop the interval
    elapsedPausedTime = new Date().getTime() - startTime; // calculate elapsed paused time
    stopwatchInterval = null; // reset the interval variable
}


 

function formatElapsed(elapsedTime) {
    let seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
    let minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes
    let hours = Math.floor(elapsedTime / 1000 / 60 / 60); // calculate hours
    let displayTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds); // format display time
    return displayTime; // update the display and save url time

}

function resetStopwatch() {

    stopStopwatch(); // stop the interval
    elapsedPausedTime = 0; // reset the elapsed paused time variable

     

    //document.getElementById("stopwatch").innerText = formatElapsed(elapsedTime); // reset the display
}

function updateStopwatch() {
    //milliseconds
    currentTime = new Date().getTime(); // get current time in milliseconds
    if(typeof elapsedPreviousTime === "undefined") {
        elapsedPreviousTime=0
    }
    elapsedTime = currentTime - (startTime);
    //window.elapsedTime = elapsedTime;
    try {
        if(typeof sendReceive !== "undefined" && sendReceive==true) {
        
            chrome.runtime.sendMessage({"elapsedTime": elapsedTime, "total":total+elapsedTime});
        } 
    }
        
    catch (error) {
        console.log(error);
        sendReceive = false;
    }
    
}

function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
}



        
chrome.tabs.onActivated.addListener(saveElapsed);
chrome.tabs.onUpdated.addListener(saveElapsed);
chrome.tabs.onRemoved.addListener(saveElapsed);

chrome.runtime.onMessage.addListener((data, sender) => {
    //Listen for message from background script
    if(data.sendReceive == true) {
        sendReceive = data.sendReceive;
    }
});








