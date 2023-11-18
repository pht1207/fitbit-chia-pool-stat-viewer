//This is the companion code, used on the smartphone to query the Flexpool API for information so that it may be sent to the fitbit watch app.

//Used to communicate with app.
import * as messaging from "messaging";
//Used to fetch settings from the user's settingStorage.
import { settingsStorage } from "settings";
let walletAddress;
let coinType;
let coin;
let wallet;

//This will set the variables, then call the queryFlexpoolAPI function so that variables can be updated dynamically rather than permanently
function setVariables(){
//Fetches the wallet address and coin type from the user's settings and checks if there even are settings first.
if(settingsStorage.getItem("address") !== null && settingsStorage.getItem("coin") !== null){
walletAddress = settingsStorage.getItem("address");
coinType = settingsStorage.getItem("coin");
//selects the coin out of the coinType string
coin = coinType.substring(20, coinType.length-19);
//selects the wallet address out of the walletAddress string
wallet = walletAddress.substring(9, walletAddress.length-2);
}

//Declares the endpoint variable which is just a link to flexpool api, inserting the user's wallet and selected coin type.
var ENDPOINT = "https://api.flexpool.io/v2/miner/stats?address="+wallet+"&coin="+coin;
  //Call the queryFlexpoolAPI function now that we've created the proper ENDPOINT with settings' current variables
  queryFlexpoolAPI(ENDPOINT);
}
//Queries flexpool's API for data
function queryFlexpoolAPI(ENDPOINT) {
  fetch(ENDPOINT) //ENDPOINT again, is the URL for the flexpool API
  .then(function (response) {
    response.json()
    .then(function(data) {
      let flexpoolData = {};
      if(data["error"] !== null){
        if(data["error"]["code"] == -33){//Code for invalid coin
          flexpoolData = {error: ['noCoin']};
        }
        else if(data["error"]["code"] == -34){//Code for invalid address
          flexpoolData = {error: ['noAddress']};
        }
        else{
          flexpoolData = {error: ['unknown']};//Code that is unlikely to happen
        }
        returnFlexpoolData(flexpoolData);
      }
      else{
      //Creates the flexpoolData object from the JSON given by the flexpool API. It has multiple variables.
      flexpoolData = {
        //Gets the coin type so it can be used in the app/index.js processFlexpoolData function once all of this is sent
        coin: [coin],
        //The 'data' is the flexpool json object that is returned, with [result], we are accessing the result object within that object
        //And with [averageEffectiveHashrate] for example, we are accessing the primitive data type inside it.
        averageEffectiveHash: data["result"]["averageEffectiveHashrate"],
        //Same premise as above, however implemented for below variables
        currentHash: data["result"]["currentEffectiveHashrate"],
        reportedHash: data["result"]["reportedHashrate"],
        validShares: data["result"]["validShares"],
        staleShares: data["result"]["staleShares"],
        invalidShares: data["result"]["invalidShares"]
      }
      // Send the flexpoolData data object to the returnFlexpoolData so that it may be sent to device.
      returnFlexpoolData(flexpoolData);
    }
    });
  })  //Catches errors and outputs into console about it.
    .catch(function (err) {
      console.error(`Error fetching flexpool data: ${err}`);
  });
}
  

//If the 'flexpoolData' message is recieved, query the flexpoolAPI using the queryFlexpoolAPI() function.
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command === "flexpoolData") {
    setVariables();//Sets the variables given what is presently in settings 
  }
});
  

//If socket is open and ready, send the fetched data to the app/index.js.
function returnFlexpoolData(data) {
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
