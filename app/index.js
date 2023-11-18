import * as document from "document";
//Used to communicate with companion
import * as messaging from "messaging";

//Creates text for the HTML elements that just has 'loading...' inside, for placeholder while content is fetched.
const effectiveHashHTML = document.getElementById("averageEffectiveHash");
effectiveHashHTML.text = `Attempting to query Flexpool.io...`;

const reportedHashHTML = document.getElementById("reportedHash");

const staleSharePercentageHTML = document.getElementById("staleSharePercentage");

const invalidSharePercentageHTML = document.getElementById("invalidSharePercentage");


const farmerName = "";
const tib_24h = "";
const currentEffort = ""


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
  //Changes the text of each HTML element to the appropriate value.
  //Displays data in format suitable to XCH
  /*if(data.coin == 'xch'){
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
  }*/

  if(data.type == 'farmer'){
    effectiveHashHTML.text = 'Farmer name: '+data.farmer_name;
    reportedHashHTML.text = 'Avg TiB/24hr: '+data.tib_24h;
    staleSharePercentageHTML.text = 'Current Effort: '+data.current_effort+'%';
    invalidSharePercentageHTML.text = "test"
  }



  //Final case if there is an error
  else if(data.error){
    if(data.error == 'noCoin'){
      effectiveHashHTML.text = `In settings, please enter your:`;
      reportedHashHTML.text = `Coin-Type and Wallet Address`;
    }
    else if(data.error == 'noAddress'){
      effectiveHashHTML.text = `In settings, please enter your:`;
      reportedHashHTML.text = `Wallet Address`;
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