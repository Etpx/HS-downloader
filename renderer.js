// This function is used when the first form is submitted.
function searchShows (event){
    // To stop refreshing the page after submitting.
    event.preventDefault();

    // If the input is empty, alert the user.
    // else delete everything then submit again.
    if(document.getElementById('showName').value === "")
       return window.Error("Input field empty!", "Please type a show name!");
    
    else if(document.getElementById("shows")){
        document.getElementById("shows").remove();
        let episodeDetails = document.getElementById("episode_details");
        // if the episode_details div is present remove it.
        episodeDetails ? episode_details.remove() : "";
    }

    // Getting the values from the form 
    let show = document.getElementById('showName').value;

    // Sending the values to the preload.
    window.showName(show);
}

// @param show: get show information from API.
// @param i: the iteration for getting the first three shows in the search.
function getPosters(show, i){

    // If the button "Submit" is there, remove it then add a text.
    if(document.getElementsByClassName("btn")[0]){
       document.getElementsByClassName("btn")[0].remove();

       let showSelection = document.createElement("h4");
       showSelection.textContent = "Please select a show: ";
       document.getElementById("content").append(showSelection);       
    }
    
    // Add the shows div.
    let shows = document.createElement("div");
    shows.id = "shows";
    shows.classList = "row";
    document.getElementById("content").append(shows);       

    // Create a div tag for each image with propper attribures.
    let div = document.createElement("div");
    div.id = `poster_${i}`;
    div.classList = "col-4";
    document.getElementById("shows").appendChild(div);

    // Create the image tag with its attributes.
    let poster = document.createElement("img");
    poster.src = ""+show.poster+"";
    poster.id = show.id;
    poster.classList = "img-fluid mx-auto my-2";
    poster.height = "130";
    poster.width = "130";
    poster.style = "pointer-events: none;";
    document.getElementById(`poster_${i}`).appendChild(poster);

    // Create element for show title.
    let text = document.createElement("p");
    text.textContent = show.title;
    document.getElementById(`poster_${i}`).appendChild(text);

    // After 1 second allow the user to click on the poster.
    setTimeout(()=>{poster.style = "cursor: pointer;"}, 1000);

    // Adding the click event to the poster
    poster.addEventListener("click", () => {

        // Loop through all the posters and make them borderless.
        for(let i=0; i<3; i++){
            // if there is only one show, continue to prevent errors.
            if(typeof document.getElementsByTagName("img")[i] === "undefined") continue;
                document.getElementsByTagName("img")[i].style = "border-style: none; cursor: pointer;";
        }
        // Change border style to the selected poster.
        poster.style = "border-style: solid;";

        // send the ID of selected poster to the preload.
        window.showID(poster.id);

        // Call the function.
        createForm(show.id);

        // Call the loader
        loader("Please wait while we fetch the episodes for you..");

    });
}

// A function to create the episode_details form.
// @param showID: the ID of the selected show by the user.
function createForm(showID){

    // If the form is there remove it. (we use this way to update the ImageID attribure based on user click.)
    if(document.getElementById("episode_details")) document.getElementById("episode_details").remove();

    // Create the form
    let form = document.createElement("form");
    form.id = "episode_details";
    document.getElementById("content").append(form);
    
    // Create row div
    let row = document.createElement("div");
    row.classList = "row";
    row.id = "row";
    document.getElementById("episode_details").append(row);


    // Create the text
    let text = document.createElement("span");
    text.classList = "col-4 my-2";
    text.style = "margin-left: 120px; font-weight: bold;";
    text.textContent = "Please select a quality:";
    document.getElementById("row").appendChild(text);

    // Create the dropdown list.
    let select = document.createElement("select");
    select.classList = "dropdown-toggle-split col-2 my-auto";
    select.id = "quality";

    // Create the options
    let option1 = document.createElement("option");
    option1.value = '1080';
    option1.textContent = '1080';
    option1.classList = "dropdown-item";
    select.append(option1);

    let option2 = document.createElement("option");
    option2.value = '720';
    option2.textContent = '720';
    option2.classList = "dropdown-item";
    select.append(option2);

    let option3 = document.createElement("option");
    option3.value = '480';
    option3.textContent = '480';
    option3.classList = "dropdown-item";
    select.append(option3);

    // Append the select to the page.
    document.getElementById("row").append(select);

    // This condition is used to prevent creating many divs.
    if(!document.getElementById('episodes')){
    
        // Create a new div
        let episodes = document.createElement("div");
        episodes.classList = "form-group";
        episodes.id = "episodes";
        document.getElementById("episode_details").append(episodes);
        
        // Create inputs
        document.getElementById('episodes').innerHTML =
        "<div class='row my-2' style='margin-left: 120px'>"
        +"<p class='my-3'><b>Enter the range of the episodes you want to download:</b></p>"
        +"<input type='text' name='start_episode' id='start_episode' class='form-control col-3 mx-2 my-2' placeholder='Start episode'/>"
        +"<input type='text' name='last_episode' id='last_episode' class='form-control col-3 mx-2 my-2' placeholder='Last episode'/>"
        +"<div class='form-check form-check-inline col-4 mx-2'><label>Download All episodes</label><input class='form-check-input' type='checkbox' id='all_episodes' onclick='checkboxValidate()'</div>"
        +"</div>"
        +"<input type='submit' value='Download' class='btn btn-success my-3' id='submitBtn' style='margin-left: 120px'>"
    }

    // If the form is submitted.
    form.addEventListener("submit", (event) => {
        // To prevent the page from reloading after submission. 
        event.preventDefault();
        
        // Get the data from the form.
        let quality = document.getElementById('quality');
        quality = quality.options[quality.selectedIndex].value;
        let startEpisode = document.getElementById('start_episode').value;
        let lastEpisode = document.getElementById('last_episode').value;
        
        // If inputs are empty, notify the user.
        if(startEpisode === "" || lastEpisode === "")
             return window.Error("Input field empty!", "Please type the range of the episodes you want to download.");
        
        // if inputs are not numbers, notify the user.
        if(isNaN(startEpisode) || isNaN(lastEpisode))
            return window.Error("Incorrect type!", "Please type numbers only.");

        loader("Please wait while we download the episodes for you..");

        // Send the selected show information to the preload.
        window.Episode(showID, quality, startEpisode, lastEpisode);
    });

}

// A function for validating 'all_episodes' checkbox.
function checkboxValidate() {
    
    let lastEpisode = document.getElementById("show_last_episode");

    // if the checkbox is pressed, add the last episode value to the input.
    if (document.getElementById("all_episodes").checked){
        document.getElementById("start_episode").value = "1";
        document.getElementById("last_episode").value = lastEpisode.name;
    }else{
        document.getElementById("start_episode").value = "";
        document.getElementById("last_episode").value = "";
    }
}

// A function to create the loader.
function loader(text){

     // Create the loader
     let loader = document.createElement("div");
     loader.classList = "center";
     loader.id = "loader";
     document.getElementById("content").append(loader);
     
     // Change background color to gray 
     document.getElementById("content").style = "background-color: grey;";
     document.getElementById("quality") === null ? "" : document.getElementById("quality").style = "background-color: grey;";
     document.querySelectorAll("input").forEach((input) => {
         input.style = "background-color: grey;";
     });

     let loaderText = document.createElement("div");
     loaderText.classList = "center";
     loaderText.id = "text";
     loaderText.textContent = ""+text+"";
     document.getElementById("content").append(loaderText);
}

// A function to remove the loader.
function removeLoader() {
        document.getElementById("loader").remove();
        document.getElementById("text").remove();

        // Change background color back to normal 
        document.getElementById("content").style = "";
        document.getElementById("quality").style = "";
        document.querySelectorAll("input").forEach((input) => {
            input.style = "";
        });

        // Restyle the button.
        document.getElementById("submitBtn").style = "margin-left: 120px";

        // remove the check
        document.getElementById("all_episodes").checked = false;

        // empity the fields 
        document.getElementById("start_episode").value = "";
        document.getElementById("last_episode").value = "";
}

function nameClick(){
    window.Click();
}