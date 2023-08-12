
    let elapsedTime=0;
    let total = 0;
   
    let displayInterval; // to keep track of the interval
    
    startDisplay();


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

        if(typeof elapsedTime !== "undefined"){
        document.getElementById("stopwatch").innerText = formatElapsed(elapsedTime);
        document.getElementById("TotalWebTime").innerText = formatElapsed(total);
        }
    }


    function pad(number) {
        // add a leading zero if the number is less than 10
        return (number < 10 ? "0" : "") + number;
    }
    

        browser.runtime.onMessage.addListener((data, sender) => {
            elapsedTime = data.elapsedTime;
            total = data.total;
        });
        
