const {app, BrowserWindow, ipcMain, dialog} = require('electron');
const path = require('path');
const HS = require('horriblesubs');
const open = require('open');

// Defining the window to prevent it from being deleted when garbage collected.
let mainWindow;
let content;

app.on('ready', () => {
    const mainWindow = new BrowserWindow({
        width: 710,
        height: 710,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            enableRemoteModule: false,
        }
    });

    // Load the html file.
    mainWindow.loadFile("index.html");

    // Open dev tools
    // mainWindow.webContents.openDevTools();

    content = mainWindow.webContents
});

ipcMain.on('showSubmission', (event, showName) => {

    HS.search(showName).then((shows) => {
        if(shows === null || shows.length === 0) return dialog.showErrorBox("No match!", "There is no show in horriblesubs.info with the provided name\n Please make sure you spilled the name correctly.");
           
            // Call the function that gets shows information.
            getShows(shows);
    });
});

app.on("window-all-closed", () => {
    // If the platform is not macOS quit the app. for macOS it will minimize the app.
    if(process.platform !== "darwin") app.quit();
});

// A function to get the shows of the first 3 matches of the search.
async function getShows(shows) {

     // Declare an array to hold the shows.
     const firstShows = [];

     // Iteration to get the first 3 shows only.
     for(let i=0; i<3; i++){
        // Add the show in the array. 
        firstShows.push(shows.shift());
        // If there is only one show, return to prevent errors.
        if(typeof firstShows[i] === "undefined") return;
         // Now wait for the show to be fetched from the API before the next iteration.
         await HS.getShow(firstShows[i].id).then((show) => {
             // Send the show and the iteration to the preload.
             content.send("show information", show, i);
         });
     }
}

// Event listener for errors.
ipcMain.on("Error", (event, title, msg) => {
    dialog.showErrorBox(title, msg);
});


ipcMain.on("Episodes", (event, showID, quality, startEpisode, lastEpisode) => {
    // Get the magnets link of the selected show.
    HS.getMagnets(showID).then(links => {

        // Get the latest episode
        let showLastEp = links[ Object.keys(links).sort().pop() ].episode;
        
        // If the entered episode is bigger than the last episode notify the user then remove the loader.
        if(parseInt(lastEpisode) > parseInt(showLastEp)){
            dialog.showErrorBox("Out of range!", `Sorry this show is only ${showLastEp} episodes`);
            // Send the event to preloader.
            return content.send("reload");
        }

        if(parseInt(startEpisode) > parseInt(lastEpisode)){
            dialog.showErrorBox("invalid range!", `Please make the start episode less than the last episode.`);
            // Send the event to preloader.
            return content.send("reload");
        }
        
        if(parseInt(startEpisode) > parseInt(showLastEp)){
            dialog.showErrorBox("Out of range!", `Sorry this show is only ${showLastEp} episodes`);
            // Send the event to preloader.
            return content.send("reload");
        }

        // Array to store the range of episodes.
        let epispdes = []

        // Loop through the specified range.
        for(let i=startEpisode; i<=lastEpisode; i++){
            // If the episode is between 1-9 add 0 before the number 
            // Because the API has 0 before every episode less than 9 (01, 02, 03, etc).
            if(i <= 9) i = "0"+i;
            // Add the episodes to the array.
            epispdes.push(i);
        }

        // Loop through all episodes selected by the user.
        epispdes.forEach(ep => {
        // Get the episode object
        let link = links[`${showID}_${ep}`];
        // If the episode is not available. 
        if(typeof link === "undefined") return dialog.showErrorBox("Episode Not found!", `Sorry episode ${ep} is not available!`);
        // If the quality is not available.
        if(link[quality] === null) return dialog.showErrorBox("Quality not found!", `Sorry the specified quality for episode ${ep} is not available`);
        // Else, open the magnet.
            return open(link[quality]);
        });
        // Send Done event to the preload.
        return content.send("Done");
    });
});

// Event listener for the selected show ID.
ipcMain.on("showID", (event, showID) => {

    HS.getMagnets(showID).then(links => {
        // Get the last episode of the selected show.
        let showLastEpisode = links[ Object.keys(links).sort().pop() ].episode;
        
        // Send the last episode to the preload.
        content.send("last episode", showLastEpisode);
    });
});