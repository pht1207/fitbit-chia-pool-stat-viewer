//Checks what device this is

import { me as device } from "device";
if (!device.screen) device.screen = { width: 348, height: 250 };
console.log(`Dimensions: ${device.screen.width}x${device.screen.height}`);


import * as document from "document";
//Used to communicate with companion
import * as messaging from "messaging";

//Creates text for the HTML elements that just has 'loading...' inside, for placeholder while content is fetched.
let farmerName = document.getElementById("farmerName");
farmerName.text = `Querying API...`;
let tib_24h = document.getElementById("tib_24h");
let currentEffort = document.getElementById("currentEffort");

//Sends a request to the companion app to fetch data from flexpool API.
function fetchSpaceFarmersData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the command/message to the companion's communication socket with 'flexpoolData' inside it.
    messaging.peerSocket.send({
      command: "fetchDataCommand"
    });
  }
}

function processSpaceFarmersData(data) {
  //Changes the text of each HTML element to the appropriate value.
  if(data.type == 'farmer'){
    farmerName.text = 'Farmer name: '+data.farmer_name;
    tib_24h.text = 'Avg TiB: '+data.tib_24h+" TiB";
    currentEffort.text = 'Current Effort: '+data.current_effort+'%';
  }

  //Final case if there is an error
  else if(data.error){
    if(data.error == 'FarmerNotFound'){
      farmerName.text = `Farmer Not Found`;
      tib_24h.text = 'Go To App Settings'
      currentEffort.text = 'Check Your Launcher ID';

    }
  }

}
//Listens to see if socket is open, if so, execute fetchSpaceFarmersData.
messaging.peerSocket.addEventListener("open", (evt) => {
  fetchSpaceFarmersData();
});


//Listens for a message from companion (meaning it is complete), will send it to the processSpaceFarmersData if so.
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data) {
    processSpaceFarmersData(evt.data);
  }//The else if listens for the settings to be sent over
});

//This is where the message from settings update is recieved
messaging.peerSocket.addEventListener("message", (evt) => {
  if (evt.data && evt.data.command === "settingsUpdate") {
    fetchSpaceFarmersData();
  }
});
  




//Listens for an error and will log one if so.
messaging.peerSocket.addEventListener("error", (err) => {
  console.error(`Connection error: ${err.code} - ${err.message}`);
  effectiveHashHTML.text="Need connection to phone";
});

// Fetch the data every 30 seconds.
setInterval(processSpaceFarmersData, 300000);