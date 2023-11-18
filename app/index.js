import * as document from "document";
//Used to communicate with companion
import * as messaging from "messaging";

//Creates text for the HTML elements that just has 'loading...' inside, for placeholder while content is fetched.
const farmerName = document.getElementById("farmerName");
farmerName.text = `Attempting to query Flexpool.io...`;

const tib_24h = document.getElementById("tib_24h");

const currentEffort = document.getElementById("currentEffort");



//Sends a request to the companion app to fetch data from flexpool API.
function fetchSpaceFarmersData() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the command/message to the companion's communication socket with 'flexpoolData' inside it.
    messaging.peerSocket.send({
      command: "flexpoolData"
    });
  }
}

function processSpaceFarmersData(data) {
  //Changes the text of each HTML element to the appropriate value.
  if(data.type == 'farmer'){
    farmerName.text = 'Farmer name: '+data.farmer_name;
    tib_24h.text = 'Avg TiB/24hr: '+data.tib_24h;
    currentEffort.text = 'Current Effort: '+data.current_effort+'%';
  }

  //Final case if there is an error
  else if(data.error){
    if(data.error == 'FarmerNotFound'){
      farmerName.text = `Farmer not found`;
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
setInterval(fetchFlexpoolData, 300000);