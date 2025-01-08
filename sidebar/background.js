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
let earliestWebDate = "";
let earliestUrlDate = "";



startTimer();

function resetData(url, all_web = false) {
    if(!all_web) {
        //if(elapsedTime>0) {
            stopStopwatch();
        //}
        //total-=elapsedTime;
        startTime = new Date().getTime() - elapsedTime;
        elapsedTime = 0;
        
        contentToStore[`ElapsedTime${url}`] = 0;
        contentToStore[`EarliestDate${url}`] = undefined;
        browser.storage.local.remove(`EarliestDate${url}`);
        browser.storage.local.remove(`ElapsedTime${url}`);
        
        //browser.storage.local.set(contentToStore);
        startTimer();
    }
    if(all_web) {
                //browser.storage.local.clear();
                stopStopwatch();
                //Get the base website user is visiting to find total time spent across all visited website urls.
                
                //getEarliestDateVisitedUrl(url,true);
                //console.log("Earliest Web Date: " + earliestWebDate);
                total = 0;
                //startTime = new Date().getTime();
                elapsedTime = 0;
                
                browser.storage.local.get().then((storedInfo) => {
                    contentToStore = storedInfo;
                    Object.keys(storedInfo).forEach((key) => {
                        if (key.startsWith(`ElapsedTime${url}`)) {
                            //contentToStore.remove(key);
                            contentToStore[key] = 0;
                            browser.storage.local.remove(key);
                            //browser.storage.local.remove(`ElapsedTime${url}`);
                        }
                        if (key.startsWith(`EarliestDate${url}`)){
                            contentToStore[key] = undefined;
                            browser.storage.local.remove(key);
                        }
                    });

                });
            //browser.storage.local.set(contentToStore);
            startTimer();
    }
    
    
}

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
             getEarliestDateVisitedUrl(priorUrl, false);
            
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
                getEarliestDateVisitedUrl(url,true);
                //console.log("Earliest Web Date: " + earliestWebDate);
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
        
        //console.log("Earliest Url Date: " + earliestUrlDate);
        if (!stopwatchInterval) {
            startTime = new Date().getTime() - (elapsedTime); // get the starting time by subtracting the elapsed paused time from the current time
            stopwatchInterval = setInterval(updateStopwatch, 100); // update every second
        }
        //earliestWebDate = getEarliestDateVisitedUrl(url);
        

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


browser.runtime.onMessage.addListener((data, sender) => {
            if (typeof data.reset_web !== "undefined" ) {
                //resetData(priorUrl, false);
                let lastPathArray = priorUrl.split('/');
                let lastHost = lastPathArray[2];
               
                let pathArray = priorUrl.split('/');
                
                let protocol = pathArray[0];
                let host = pathArray[2];
                let url = protocol + '//' + host;
                resetData(priorUrl, false);
                resetData(url, true);
                
            }
            if (typeof data.reset_url !== "undefined" ) {
                
                resetData(priorUrl, false);
            }
});

function updateStopwatch() {
    currentTime = new Date().getTime(); // get current time in milliseconds
    
    elapsedTime = currentTime - (startTime);
    window.elapsedTime = elapsedTime;
    if (browser.runtime.onMessage !=null) {
        browser.runtime.sendMessage({"elapsedTime": elapsedTime, "total":total+elapsedTime, "earliestUrlDate": earliestUrlDate, "earliestWebDate": earliestWebDate});
    }
}

function getAmPm(today) {
    var hours = today.getHours();
    var ampm = hours < 12 ? 'AM' : 'PM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return hours + ':' + String(today.getMinutes().toString().padStart(2, '0')) + ' ' + ampm;
}

function getEarliestDateVisitedUrl(url, webDate=false) {

     browser.storage.local.get(`EarliestDate${url}`).then((storedInfo) => {
            
            if (webDate)
                earliestWebDate= storedInfo[Object.keys(storedInfo)[0]];
                if(typeof earliestWebDate == "undefined") {
                    //Earliest Date doesn't exist, add current date.
                    var today = new Date();
                    earliestWebDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${getAmPm(today)}`;
                    
                    contentToStore[`EarliestDate${url}`] = `${earliestWebDate}`;
                    
                    browser.storage.local.set(contentToStore);
                }
            if (!webDate) {
                earliestUrlDate= storedInfo[Object.keys(storedInfo)[0]];
                if(typeof earliestUrlDate == "undefined") {
                    //Earliest Date doesn't exist, add current date.
                    var today = new Date();
                    earliestUrlDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${getAmPm(today)}`;
                    
                    contentToStore[`EarliestDate${url}`] = `${earliestUrlDate}`;
                    browser.storage.local.set(contentToStore);
                }
                
                
            }
            
     });

     //console.log(temp_str);
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




window.addEventListener('beforeunload', 
    function(details) {
        unload =true;
        saveElapsed();
    }
);







