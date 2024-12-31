var priorUrl;
var currentTab;
var startTime;
var elapsedTime=0;
var elapsedPreviousTime=0;
var myWindowId;
var contentToStore = {};
var total = 0;
var stopwatchInterval; // to keep track of the interval 
var elapsedPausedTime;

class Mutex {
  constructor() {
    this.locked = false;
    this.queue = [];
  }

  lock() {
    return new Promise((resolve) => {
      if (!this.locked) {
        this.locked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  unlock() {
    if (this.queue.length > 0) {
      const resolve = this.queue.shift();
      resolve();
    } else {
      this.locked = false;
    }
  }
}

const mutex = new Mutex();
startTimer();

async function saveElapsed() {
    await mutex.lock();
    try {
        let new_url;
        browser.tabs.query({
            active: true,
            currentWindow: true
        }).then(tabs => {
            new_url = tabs[0].url;

            if (priorUrl !== new_url) {
                contentToStore[`ElapsedTime${currentTab}`] = elapsedTime;
                browser.storage.local.set(contentToStore);
                let priorElapsedTime = elapsedTime;
                stopStopwatch();
                resetStopwatch();
                
                
                elapsedTime= 0;
                browser.storage.local.get(`ElapsedTime${new_url}`).then((storedInfo) => {
                    
                    elapsedPreviousTime = storedInfo[Object.keys(storedInfo)[0]];
                    if(typeof elapsedPreviousTime === "undefined"){
                        elapsedPreviousTime=0;
                    }
                   
                    
                    
                    
                    let lastPathArray = priorUrl.split('/');
                    let lastHost = lastPathArray[2];
                   
                    priorUrl = currentTab;
                    
                    currentTab = new_url;
                    //Retrieve elapsed time spent on website based on existing keys
                    let pathArray = currentTab.split('/');
                    
                    let protocol = pathArray[0];
                    let host = pathArray[2];
                    let url = protocol + '//' + host;
                    
                    
                    total = 0;
                    

                    browser.storage.local.get().then((storedInfo) => {
                        Object.keys(storedInfo).forEach((key) => {
                            if (key.startsWith(`ElapsedTime${url}`) && key !== `ElapsedTime${currentTab}`) {
                                total += storedInfo[key];
                            }
                        });
                    startTime = new Date().getTime() - elapsedPreviousTime;
                    startTimer();

                    });
                });
            }
        });
    } finally {
        mutex.unlock();
    }
}

function startTimer() {
    
    //saveElapsed();
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
const update_stopwatch_mutex = new Mutex()

async function updateStopwatch() {
    await update_stopwatch_mutex.lock();
    try {
    //milliseconds
    currentTime = new Date().getTime(); // get current time in milliseconds
    if(typeof elapsedPreviousTime === "undefined") {
        elapsedPreviousTime=0
    }
    elapsedTime = currentTime - (startTime);
    window.elapsedTime = elapsedTime;
    
    browser.runtime.sendMessage({"elapsedTime": elapsedTime, "total":total+elapsedTime});
    }catch (error) {
        // On a browser window without onActiveChanged i.e not a 'tab'
    }
     finally {
        update_stopwatch_mutex.unlock();
    }

}

function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
}

        
browser.tabs.onActivated.addListener(saveElapsed);
browser.tabs.onUpdated.addListener(saveElapsed);
try {
    browser.tabs.onActiveChanged.addListener(saveElapsed);
    } catch (error) {
        // On a browser window without onActiveChanged i.e not a 'tab'
        
    }

browser.tabs.onRemoved.addListener(saveElapsed);








