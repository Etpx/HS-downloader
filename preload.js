const { ipcRenderer } = require("electron");
const open = require("open");

// Get show name from renderer then send the values to the main proccess.
window.showName = (show) => {
    ipcRenderer.send("showSubmission", show);
}

// Listen to "show information" event from main process.
ipcRenderer.on("show information", (event, show, i) => {
    getPosters(show, i);
});

// Get episode from renderer page then send it to the main page.
window.Episode = (showID, quality, startEpisode, lastEpisode) => {
    ipcRenderer.send("Episodes", showID, quality, startEpisode, lastEpisode);
}

// Get the error from renderer page then send it to the main page.
window.Error = (title, msg) => {
    ipcRenderer.send("Error", title, msg);
}

// If the tool is done dowloading, send a thank you alert then reload the page.
ipcRenderer.on("Done", (event) => {
    // Wait for three seconds.
    setTimeout(() => { 
        alert("The download is done, thank you for using the tool.");
        location.reload();
    }, 3000);
});

// Send the showID coming from the renderer to the main process.
window.showID = (showID) => {
    ipcRenderer.send("showID", showID);
}

// Listen for the event to get the last episode.
ipcRenderer.on("last episode", (event, showLastEpisode) => {
    
    // Split the first occurance of "0" from episodes 1-9.
    // Since they came with "0" before every number. (e.g, 01, 02, etc).
    if(showLastEpisode < 9) 
       showLastEpisode = showLastEpisode.split('0').slice(1).join('0');

    // Create a div element with the specified values.
    let lastEpisode = document.createElement("div");
    lastEpisode.id = "show_last_episode";
    lastEpisode.name = ""+showLastEpisode+"";
    lastEpisode.style = "margin-left: 140px; font-weight: bold;";
    lastEpisode.classList = "my-3";
    lastEpisode.textContent = `The last episode of this show is: ${showLastEpisode}`;
    document.getElementById("row").append(lastEpisode);
    
    // Remove the loader
    removeLoader();
});

// Listen to the event then remove the loader.
ipcRenderer.on("reload", (event) => {
    removeLoader();
});

window.Click = () => {
    open("https://twitter.com/Etpx_");
}