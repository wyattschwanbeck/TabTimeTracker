

//window.onload = function () {

    let priorUrl;
    //let currentTime= new Date().getTime();
    let currentTab;
    let startTime;
    let elapsedTime=0;
    let elapsedPreviousTime=0;
    let myWindowId;
    let contentToStore = {};
    //let startTime; // to keep track of the start time
    let stopwatchInterval; // to keep track of the interval
    let elapsedPausedTime;

    let buttonStart = document.getElementById('button-start');
    let buttonStop = document.getElementById('button-stop');
    let buttonReset = document.getElementById('button-reset');

    
    startTimer();

    function saveElapsed() {
        let new_url;
        browser.tabs.query({
            active: true,
            currentWindow: true
        }).then(tabs => {
            new_url = tabs[0].url;

            if (priorUrl !== new_url || currentTab !== new_url) {
                contentToStore[`ElapsedTime${currentTab}`] = elapsedTime;
                let priorElapsedTime = elapsedTime;
                elapsedTime= 0;
                browser.storage.local.get(`ElapsedTime${new_url}`).then((storedInfo) => {
                    elapsedPreviousTime = storedInfo[Object.keys(storedInfo)[0]];
                    startTime = new Date().getTime() - elapsedPreviousTime;
                     browser.storage.local.set(contentToStore);
                    stopStopwatch();
                    resetStopwatch();
                    startTimer();
                    let lastPathArray = priorUrl.split('/');
                    let lastHost = lastPathArray[2];
                   
                    priorUrl = currentTab;
                    
                    currentTab = new_url;
                    //Retrieve elapsed time spent on website based on existing keys
                    let pathArray = currentTab.split('/');
                    
                    let protocol = pathArray[0];
                    let host = pathArray[2];
                    let url = protocol + '//' + host;
                    let total = 0;
                     // if(lastHost === host) {
                         // total += priorElapsedTime;
                      // }
                    

                    browser.storage.local.get().then((storedInfo) => {
                        Object.keys(storedInfo).forEach((key) => {
                            if (key.startsWith(`ElapsedTime${url}`)) {
                                total += storedInfo[key];
                            }
                        });
                        
                        document.getElementById("TotalWebTime").innerText = formatElapsed(total);
                    });
                });
            }
        });
    }

    function startTimer() {
        
        saveElapsed();
         browser.tabs.query({
             currentWindow: true , active: true
         }).then((tabs) => {
             priorUrl = tabs[0].url;
         });
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
    
    //On Tab activated, updated current url
     

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

         

        document.getElementById("stopwatch").innerText = formatElapsed(elapsedTime); // reset the display
    }

    function updateStopwatch() {
        //milliseconds
        currentTime = new Date().getTime(); // get current time in milliseconds
        if(typeof elapsedPreviousTime === "undefined") {
            elapsedPreviousTime=0
        }
        elapsedTime = currentTime - (startTime);

        //startTime = new Date().getTime() - elapsedTime;
        //contentToStore[`ElapsedTime${currentTab}`] = elapsedTime;
               
        // browser.storage.local.set(contentToStore);
        //priorUrl = currentTab;
        //contentToStore[`NavTime${currentTab}`] = currentTime;

        document.getElementById("stopwatch").innerText = formatElapsed(elapsedTime);
    }

    function pad(number) {
        // add a leading zero if the number is less than 10
        return (number < 10 ? "0" : "") + number;
    }
    
        
        browser.tabs.onActivated.addListener(saveElapsed);
        browser.tabs.onUpdated.addListener(
        saveElapsed // optional object
        );
        
        browser.tabs.onRemoved.addListener(saveElapsed);
        browser.tabs.onActiveChanged.addListener(saveElapsed);
        
        


//browser.pageAction.onClicked.addListener(saveElapsed);




