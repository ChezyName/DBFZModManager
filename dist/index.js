const { readTextFile , writeTextFile , copyFile , createDir , readDir } = window.__TAURI__.fs;
const { appWindow } = window.__TAURI__.window;
const invoke = window.__TAURI__.invoke
const { open } = window.__TAURI__.dialog;
const { configDir , join } = window.__TAURI__.path;

//===============================================
// INIT VARS
let DBFZFolder;

let modsTab = document.getElementById("modsWindow");

let topText = document.getElementById("title");
topText.innerHTML = "Loading DBFZ MM";

//stop right click context menu
document.addEventListener('contextmenu', event => event.preventDefault());

console.log("B4 Roaming");

let app_Dir = await configDir();
let appRoaming = await join(app_Dir,"DBFZMM");

console.log("TYPE OF APPROAMING - " + typeof appRoaming)

invoke('exists',{path: appRoaming}).then((val) => {
  console.log(" Means Dir Exists?")
  console.log(val);
  if(val == false){
    createDir(appRoaming);
  }
});

console.log("Created DIR");

let dataPath = appRoaming+'/DBFZmods.conf';

//get the files

//===============================================
// MAIN FUNCTIONS
function getAllMods(){
  return new Promise(async function(resolve){
    if(DBFZFolder != null){
      let modsF = await join(DBFZFolder.replace('"',''),"RED","Content","Paks","~mods");
      console.log("TYPE OF MODSF - " + typeof modsF)
      invoke('exists',{path: modsF}).then(async (data) => {
        console.log("Path Is Valid? -> " + data.toString());
        if(data == true){
          let mods = await readDir(modsF);
          console.log("All Mods In Folder ARE ->");
          console.log(mods);
          resolve(mods);
        }
      });
    }

    resolve(null);
  });
}

async function createModItem(modName){
  const mod = document.createElement("div");
  mod.tagName = modName;
  modsTab.append(mod);
}

function clearMods(){
  var child = modsTab.lastElementChild; 
  while (child) {
      modsTab.removeChild(child);
      child = modsTab.lastElementChild;
  }
}

async function saveDBFZFolder(data){
  await writeTextFile(dataPath, JSON.stringify(data));
  topText.innerHTML = "Loaded DBFZ MM";
  invoke("addScope",{path: DBFZFolder});
  getAllMods();
}

//===============================================
// Loading

invoke('exists',{path: dataPath}).then(async (yn) => {
  console.log("PATH EXSISTS? " + yn);
  if(yn){
    const contents = await readTextFile(dataPath);
    console.log("LOADING FROM FILE...")
    console.log(contents)
    if(contents != null && contents != ""){
      //valid file
      DBFZFolder = JSON.parse(contents);
      topText.innerHTML = "Loaded DBFZ MM";
      saveDBFZFolder(DBFZFolder);
    }
  }
});

//===============================================
// BUTTON FUNCTIONS

//minimize button
document
  .getElementById('minimize')
  .addEventListener('click', () => appWindow.minimize())

//close app button
document
  .getElementById('close')
  .addEventListener('click', () =>{
    console.log("Closing");
    appWindow.close();
  })


//open the folder
document
  .getElementById('folder')
  .addEventListener('click', async () =>{
    const selected = await open({
      directory: true,
      multiple: false,
      defaultPath: "C:",
    });

    if(selected != ""){
      
    console.log(selected);
    saveDBFZFolder(selected);
    let dbfzBin = await join(selected, 'RED', 'Binaries', 'Win64');
    let modsF = await join(selected,'RED','Content','Paks',"~mods");

    //create modded ver of game
    let copiedFile = dbfzBin+'/RED-Win64-Shippping-eac-nop-loader.exe.exe'
    invoke('exists',{path: copiedFile}).then((data) => {
      if(data == false){
        copyFile(dbfzBin+'/RED-Win64-Shipping.exe',copiedFile); 
      }
    });
  
    //create mod dir
    invoke('exists',{path: modsF}).then((data) => {
      if(data == false){
        createDir(modsF);
      }
    });

    saveDBFZFolder(selected);
    }
  })

console.log("FOLDER -> " + DBFZFolder);
if(DBFZFolder == "" || DBFZFolder == null || DBFZFolder == undefined) topText.innerHTML = "<- Click The F!";