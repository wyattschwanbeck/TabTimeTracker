import Mutex from "mutex.js"
    let showButton = document.getElementById("showBtn");
    let hideBtn = document.getElementById("hideBtn");
    hideBtn.onclick =closeNav;
    showBtn.onclick = openNav;
    browser.def
    /* Set the width of the sidebar to 250px (show it) */
function openNav() {
  document.getElementById("mySidepanel").style.width = "600px";
  //let update = browser.windows.getCurrent.update(browser.windows.getCurrent().windowId, {"width" : 600});
  //browser.windows.getCurrent().WindowState = "minimized";
  
}

/* Set the width of the sidebar to 0 (hide it) */
function closeNav() {
  document.getElementById("mySidepanel").style.width = "0";
  //let update = browser.windows.getCurrent.update(browser.windows.getCurrent().windowId, {"width" : 5});
  //browser.windows.getCurrent().WindowState = "docked";
  
} 

