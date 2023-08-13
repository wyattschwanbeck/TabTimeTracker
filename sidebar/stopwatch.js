
let elapsedTime=0;
let total = 0;

let displayInterval; // to keep track of the interval

startDisplay(); //If webpage is open, start display interval
function startDisplay() {
    displayInterval = setInterval(updateDisplay, 100); // update every second
    
    
    
}

function formatElapsed(elapsedTime) {
    let seconds = Math.floor(elapsedTime / 1000) % 60; // calculate seconds
    let minutes = Math.floor(elapsedTime / 1000 / 60) % 60; // calculate minutes
    let hours = Math.floor(elapsedTime / 1000 / 60 / 60); // calculate hours
    let displayTime = pad(hours) + ":" + pad(minutes) + ":" + pad(seconds); // format display time
    return displayTime; // update the display and save url time

}


function updateDisplay() {
    chrome.runtime.sendMessage({"sendReceive": true});
    if(typeof elapsedTime !== "undefined"){
        document.getElementById("stopwatch").innerText = formatElapsed(elapsedTime);
        document.getElementById("TotalWebTime").innerText = formatElapsed(total);
    }
}


function pad(number) {
    // add a leading zero if the number is less than 10
    return (number < 10 ? "0" : "") + number;
}




chrome.runtime.onMessage.addListener((data, sender) => {
    //Listen for message from background script
    if(typeof data.elapsedTime !== "undefined") {
        elapsedTime = data.elapsedTime;
        total = data.total;
    }
});

