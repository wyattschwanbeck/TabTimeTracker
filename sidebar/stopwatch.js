
    let elapsedTime=0;
    let total = 0;
   let EarliestWebDate = "";
    let EarliestUrlDate = "";
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
        document.getElementById("EarliestWebDate").innerHTML = "Since <em>" + EarliestWebDate + "</em>";
        document.getElementById("EarliestUrlDate").innerHTML = "Since <em>" + EarliestUrlDate + "</em>";
        }
    }


    function pad(number) {
        // add a leading zero if the number is less than 10
        return (number < 10 ? "0" : "") + number;
    }
    

function reset_web() {
    browser.runtime.sendMessage({"reset_web":true});
}

function reset_url() {
    browser.runtime.sendMessage({"reset_url":true});
}
browser.runtime.onMessage.addListener((data, sender) => {
            if (data.elapsedTime){
            elapsedTime = data.elapsedTime;
            total = data.total;
            EarliestUrlDate = data.earliestUrlDate;
            //document.getElementById("EarliestUrlDate").innerText = data.earliestUrlDate;
            EarliestWebDate = data.earliestWebDate;
            }
        }); 

document.addEventListener('DOMContentLoaded', (event) => {
  // Your code to execute after the DOM is fully loaded
  var reset_url_btn = document.getElementById("reset_url_btn");
  
  
  reset_url_btn.addEventListener("click", function () {
      browser.runtime.sendMessage({"reset_url":true});
  });
  
  var reset_web_btn = document.getElementById("reset_web_btn");
  reset_web_btn.addEventListener("click", function () {
      browser.runtime.sendMessage({"reset_web":true});
  });
  
  var butt1 = document.getElementById("button1");
   butt1.addEventListener("click", function() {
    
    // this.classList.toggle("active");
    var content = document.getElementById("content1");
    if (content.style.display === "block") {
      content.style.display = "none";
      butt1.innerHTML  = "+";
    } else {
      content.style.display = "block";
      butt1.innerHTML  = "-";
    }
  }
  );
  
   var butt2 = document.getElementById("button2");
   butt2.addEventListener("click", function() {
    
    // this.classList.toggle("active");
    var content = document.getElementById("content2");
    if (content.style.display === "block") {
      content.style.display = "none";
      butt2.innerHTML  = "+";
    } else {
      content.style.display = "block";
      butt2.innerHTML  = "-";
    }
  }
  );
  
  
  
});


//for (i = 0; i < coll.length; i++) {
 
  
