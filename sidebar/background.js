let priorUrl = "";
let currentTab = "";
let startTime;
let elapsedTime=0;
let elapsedPreviousTime=0;
let myWindowId;
let contentToStore = {};
let total = 0;
let stopwatchInterval; // to keep track of the interval 
let unload = false;
let saving = false;


startTimer();
//}
function saveElapsed() {
        let new_url;
        browser.tabs.query({
            active: true,
            currentWindow: true
        }).then(tabs => {
            new_url = tabs[0].url;
            
            if ((priorUrl !== new_url && new_url !== "" && elapsedTime!=0) || unload) {
                var temp_elapsed = {};
                contentToStore[`ElapsedTime${priorUrl}`] = elapsedTime;
                browser.storage.local.set(contentToStore);
                let priorElapsedTime = elapsedTime;
                
                elapsedTime= 0;
                
                priorUrl = currentTab;
                    
                currentTab = new_url;
                
                if(unload) {
                    unload = false;
                }
                startTimer();
            }
           
        });
    
}



function startTimer() {
         browser.tabs.query({
             active: true,
             currentWindow: true
         }).then((tabs) => {
             if (priorUrl == "" || priorUrl!= tabs[0].url) {
             priorUrl = tabs[0].url;
             currentTab = priorUrl;
             browser.storage.local.get(`ElapsedTime${priorUrl}`).then((storedInfo) => {
            
             elapsedTime = storedInfo[Object.keys(storedInfo)[0]];
             if(typeof elapsedTime === "undefined") {
                    elapsedTime = 0;
             }
                //Get the base website user is visiting to find total time spent across all visited website urls.
                let lastPathArray = tabs[0].url.split('/');
                let lastHost = lastPathArray[2];
               
                let pathArray = tabs[0].url.split('/');
                
                let protocol = pathArray[0];
                let host = pathArray[2];
                let url = protocol + '//' + host;
                
                
                total = 0;
                
                startTime = new Date().getTime() - elapsedTime;
                browser.storage.local.get().then((storedInfo) => {
                    Object.keys(storedInfo).forEach((key) => {
                        if (key.startsWith(`ElapsedTime${url}`) && key != `ElapsedTime${priorUrl}`) {
                            total += storedInfo[key];
                        }
                    });

                });

             });  
          }
          
         });
           
         
        currentTime = new Date().getTime();
       
        if (!stopwatchInterval) {
            startTime = new Date().getTime() - (elapsedTime); // get the starting time by subtracting the elapsed paused time from the current time
            stopwatchInterval = setInterval(updateStopwatch, 100); // update every second
        }

}

function stopStopwatch() {
    clearInterval(stopwatchInterval); // stop the interval  
    stopwatchInterval = null; // reset the interval variable
}


 

function formatElapsed(elapsedTime) {
    let seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
    let minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes
    let hours = Math.floor(elapsedTime / 1000 / 60 / 60); // calculate hours
    let displayTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds); // format display time
    return displayTime; // update the display and save url time

}




function updateStopwatch() {
    currentTime = new Date().getTime(); // get current time in milliseconds
    
    elapsedTime = currentTime - (startTime);
    window.elapsedTime = elapsedTime;
    if (browser.runtime.onMessage !=null) {
        browser.runtime.sendMessage({"elapsedTime": elapsedTime, "total":total+elapsedTime});
    }
}

function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
}


browser.tabs.onActivated.addListener(function(details) {
        var temp_url;
        if(details["tabId"] !== details["previousTabId"]) {
            browser.tabs.query({
            active: true,
            currentWindow: true
        }).then(tabs => {
            temp_url = tabs[0].url;
            if(temp_url !== currentTab) {
                saveElapsed();
            }
        });
        }
        
    }
);
browser.tabs.onUpdated.addListener(
    function(details) {
        var temp_url;
        browser.tabs.query({
            active: true,
            currentWindow: true
        }).then(tabs => {
            temp_url = tabs[0].url;
            if(temp_url !== currentTab) {
                saveElapsed();
            }
        });
    }
);




browser.tabs.addEventListener('beforeunload', (event) => {
  unload =true;
  saveElapsed();
});







