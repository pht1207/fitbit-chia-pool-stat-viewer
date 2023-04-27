import * as document from "document";
//Used to communicate with companion
import * as messaging from "messaging";

//Creates text for the HTML elements that just has 'loading...' inside, for placeholder while content is fetched.
const effectiveHashHTML = document.getElementById("averageEffectiveHash");
effectiveHashHTML.text = `Loading...`;

const reportedHashHTML = document.getElementById("reportedHash");

const staleSharePercentageHTML = document.getElementById("staleSharePercentage");

const invalidSharePercentageHTML = document.getElementById("invalidSharePercentage");

//Sends a request to the companion app to fetch data from flexpool API.
function fetchFlexpoolData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the command/message to the companion's communication socket with 'flexpoolData' inside it.
    messaging.peerSocket.send({
      command: "flexpoolData"
    });
  }
}

function processFlexpoolData(data) {

  //Console logs just to make sure everything works fine on dev end.
  console.log(`working!`);
  //Changes the text of each HTML element to the appropriate value.
  //Displays data in format suitable to XCH
  if(data.coin == 'xch'){
    if(data.averageEffectiveHash > 1000000000000000){
      effectiveHashHTML.text = `Avg Effective Space: ${(data.averageEffectiveHash/1000000000000000).toFixed(2)}PB`;
    }
    else{
      effectiveHashHTML.text = `Avg Effective Space: ${(data.averageEffectiveHash/1000000000000).toFixed(2)}TB`;
    }
    if(data.reportedHash > 1000000000000000){
      reportedHashHTML.text = `Reported Space: ${(data.reportedHash/1000000000000).toFixed(2)}PB`;
    }
    else{
      reportedHashHTML.text = `Reported Space: ${(data.reportedHash/1000000000000).toFixed(2)}TB`;
    }
    staleSharePercentageHTML.text = `Stale Share Percentage: ${((data.staleShares/data.validShares)*100).toFixed(2)}%`;
    invalidSharePercentageHTML.text = `Invalid Share Percentage: ${((data.invalidShares/data.validShares)*100).toFixed(2)}%`;
  }

  //Displays data in format suitable to ETC
  else if(data.coin == 'etc'){
    if(data.averageEffectiveHash > 1000000000){
      effectiveHashHTML.text = `Avg Effective Hashrate: ${(data.averageEffectiveHash/1000000000).toFixed(2)}GH/s`;
    }
    else{
      effectiveHashHTML.text = `Avg Effective Hashrate: ${(data.averageEffectiveHash/1000000).toFixed(2)}MHs/s`;

    }
    if(data.reportedHash > 1000000000){
      reportedHashHTML.text = `Reported Hashrate: ${(data.reportedHash/1000000000).toFixed(2)}GH/s`;
    }
    else{
      reportedHashHTML.text = `Reported Hashrate: ${(data.reportedHash/1000000).toFixed(2)}MH/s`;
    }
    staleSharePercentageHTML.text = `Stale Share Percentage: ${((data.staleShares/data.validShares)*100).toFixed(2)}%`;
    invalidSharePercentageHTML.text = `Invalid Share Percentage: ${((data.invalidShares/data.validShares)*100).toFixed(2)}%`;
  }

  //Displays data in format suitable to IRON
  else if(data.coin == 'iron'){
    if(data.averageEffectiveHash > 1000000000000){
      effectiveHashHTML.text = `Avg Effective Hashrate: ${(data.averageEffectiveHash/1000000000000).toFixed(2)}TH/s`;
    }
    else if(data.averageEffectiveHash > 1000000000){
      effectiveHashHTML.text = `Avg Effective Hashrate: ${(data.averageEffectiveHash/1000000000).toFixed(2)}GH/s`;
    }
    else{
      effectiveHashHTML.text = `Avg Effective Hashrate: ${(data.averageEffectiveHash/1000000).toFixed(2)}MHs/s`;
    }
    if(data.reportedHash > 1000000000){
      reportedHashHTML.text = `Reported Hashrate: ${(data.reportedHash/1000000000).toFixed(2)}GH/s`;
    }
    else{
      reportedHashHTML.text = `Reported Hashrate: ${(data.reportedHash/1000000).toFixed(2)}MH/s`;
    }
    staleSharePercentageHTML.text = `Stale Share Percentage: ${((data.staleShares/data.validShares)*100).toFixed(2)}%`;
    invalidSharePercentageHTML.text = `Invalid Share Percentage: ${((data.invalidShares/data.validShares)*100).toFixed(2)}%`;
  }
  //Final case if there is an error
  else if(data.error){
    if(data.error == 'noCoin'){
      effectiveHashHTML.text = `In settings, please enter:`;
      reportedHashHTML.text = `Coin-Type and Address`;
    }
    else if(data.error == 'noAddress'){
      effectiveHashHTML.text = `In settings, please enter:`;
      reportedHashHTML.text = `Correct Address`;
    }
    else if(data.error == 'unknown'){
      effectiveHashHTML.text = `Unknown error with flexpool API`;
    }
    staleSharePercentageHTML.text = ``;
    invalidSharePercentageHTML.text = ``;

  }

}
//Listens to see if socket is open, if so, execute fetchFlexpoolData.
messaging.peerSocket.addEventListener("open", (evt) => {
  fetchFlexpoolData();
});


//Listens for a message from companion (meaning it is complete), will send it to the processFlexpoolData if so.
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data) {
    processFlexpoolData(evt.data);
  }//The else if listens for the settings to be sent over
});

//This is where the message from settings update is recieved
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command === "settingsUpdate") {
    fetchFlexpoolData();
  }
});
  




//Listens for an error and will log one if so.
messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
  effectiveHashHTML.text="Need connection to phone";
});

// Fetch the data every 30 seconds.
setInterval(fetchFlexpoolData, 300000);