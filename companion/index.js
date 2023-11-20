//This is the companion code, used on the smartphone to query the SpaceFarmers API for information so that it may be sent to the fitbit watch app.

//Used to communicate with app.
import * as messaging from "messaging";
//Used to fetch settings from the user's settingStorage.
import { settingsStorage } from "settings";
let launcherID;
let sentLauncherID;

//This will set the variables, then call the querySpaceFarmersAPI function so that variables can be updated dynamically rather than permanently
function setVariables(){
//Fetches the wallet address and coin type from the user's settings and checks if there even are settings first.
if(settingsStorage.getItem("launcherID") !== null){
  const settingsObject = JSON.parse(settingsStorage.getItem("launcherID"));
  launcherID = settingsObject.name;
  //selects the launcherID out of the launcherID string
  if(launcherID.length === 66){
    sentLauncherID = launcherID.substring(2, launcherID.length-1)
  }
  else if(launcherID.length === 64){
    sentLauncherID = launcherID;
  }
  sentLauncherID;
  console.log(sentLauncherID)
}

//Declares the endpoint variable which is just a link to spacefarmers api, inserting the user's wallet and selected coin type.
var ENDPOINT = "https://spacefarmers.io/api/farmers/"+sentLauncherID;
  //Call the querySpaceFarmersAPI function now that we've created the proper ENDPOINT with settings' current variables
  querySpaceFarmersAPI(ENDPOINT);
}
//Queries SpaceFarmers's API for data
function querySpaceFarmersAPI(ENDPOINT) {
  fetch(ENDPOINT)
  .then(function (response) {
    response.json()
    .then(function(data) { //Data is what is received from api call
      let spaceFarmersData = {};
      if(data["error"] === "Farmer not found"){
        spaceFarmersData = {error: ["FarmerNotFound"]}
        sendSpaceFarmersDataToApp(spaceFarmersData);
      }
      else{
      //Creates the spaceFarmersData object from the JSON given by the SpaceFarmers API. It has multiple variables.
      spaceFarmersData = {
        type: data["data"]["type"],
        farmer_name: data["data"]["attributes"]["farmer_name"],
        tib_24h: data["data"]["attributes"]["tib_24h"],
        current_effort: data["data"]["attributes"]["current_effort"]
      }
      // Send the spaceFarmersData data object to the sendSpaceFArmersDataToApp so that it may be sent to device.
      sendSpaceFarmersDataToApp(spaceFarmersData);
    }
    });
  })  //Catches errors and outputs into console about it.
    .catch(function (err) {
      console.error(`Error fetching flexpool data: ${err}`);
  });
}
  

//If the 'fetchDataCommand' message is recieved, query the flexpoolAPI using the queryFlexpoolAPI() function.
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command === "fetchDataCommand") {
    setVariables();//Sets the variables given what is presently in settings 
  }
});
  

//If socket is open and ready, send the fetched data to the app/index.js.
function sendSpaceFarmersDataToApp(data) {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else { //If it can't console log an error.
    console.error("Error: Connection is not open");
  }
}
  

//If an error is caught in any connection, log in console an error message.
messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
});




//The below code is dedicated to dynamically updating the settings
//This function is dedicated to updating the fitbit screen if the settings are changed.
//It will send the message 'settingsUpdate, if they are changed. 
//Sends the message to /app/index.js.
settingsStorage.addEventListener("change", function(){
  //if socket is open and ready, send the below info
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send({
      command: "settingsUpdate"
    });
  } 
  else { //If it can't console log an error.
    console.error("Error: Connection is not open");
  }
});
