const { readTextFile , writeTextFile , copyFile , createDir , readDir } = window.__TAURI__.fs;
const { appWindow } = window.__TAURI__.window;
const invoke = window.__TAURI__.invoke
const { open } = window.__TAURI__.dialog;
const { configDir , join , basename } = window.__TAURI__.path;

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
let searchBar = document.getElementById('search')
function searchMods(){
  // Declare variables
  var input, filter, ul, li, a, i, txtValue;
  input = searchBar.value.toLowerCase();
  li = document.querySelectorAll('.ACTIVE, .INACTIVE');
  console.log("Gotten Input of " + input);

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    console.log("Testing " + li[i].innerHTML);
    if(li[i].innerHTML.toString().toLowerCase().includes(input)){
      li[i].style.display = "block";
      console.log("T")
    }
    else{
      li[i].style.display = "none";
      console.log("F")
    }
  }
}
searchBar.addEventListener('keyup',searchMods);

function clearMods(){
  // iterate over all child nodes
  modsTab.replaceChildren();
}

async function getAllMods(){
  clearMods();

  if(DBFZFolder != null){
    let modsF = await join(DBFZFolder.replace('"',''),"RED","Content","Paks","~mods");
    let dmods = await join(DBFZFolder.replace('"',''),"RED","Content","Paks","dmods");

    //active mods
    console.log("TYPE OF MODSF - " + typeof modsF)
    invoke('exists',{path: modsF}).then(async (data) => {
      console.log("Path Is Valid? -> " + data.toString());
      if(data == true){
        let mods = await readDir(modsF);
        console.log("All Mods In Folder ARE ->");
        console.log(mods);

        mods.forEach(modPath => {
          createModItem(modPath,true);
        });
      }
    });

    //inactive mods
    console.log("TYPE OF DMODS - " + typeof dmods)
    invoke('exists',{path: dmods}).then(async (data) => {
      console.log("Path Is Valid? -> " + data.toString());
      if(data == true){
        let mods = await readDir(dmods);
        console.log("All Mods In Folder ARE ->");
        console.log(mods);

        mods.forEach(modPath => {
          createModItem(modPath,false);
        });
      }
    });
  }
}

async function createModItem(modName,active){
  const mod = document.createElement("button");
  mod.id = JSON.stringify(modName["path"]);
  mod.innerHTML = modName["name"] + " [" + (active ? "ACTIVE" : "INACTIVE") + "]";
  mod.classList.add(active ? "ACTIVE" : "INACTIVE");
  modsTab.append(mod);
}


async function saveDBFZFolder(data){
  await writeTextFile(dataPath, JSON.stringify(data));
  topText.innerHTML = "Loaded DBFZ MM";
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
      getAllMods();
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
      let main = await join(selected,'RED','Content','Paks');
      invoke('exists',{path: main}).then(async (d) => {
        if(d){
          console.log(selected);
          saveDBFZFolder(selected);
          let dbfzBin = await join(selected, 'RED', 'Binaries', 'Win64');
          let modsF = await join(selected,'RED','Content','Paks',"~mods");
          let dmods = await join(selected,'RED','Content','Paks',"dmods");
    
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
          invoke('exists',{path: dmods}).then((data) => {
            if(data == false){
              createDir(dmods);
            }
          });
    
          saveDBFZFolder(selected);
        }
        else{
          topText.innerHTML = "Invalid Folder.";
        }
      });
    }
  });

console.log("FOLDER -> " + DBFZFolder);
if(DBFZFolder == "" || DBFZFolder == null || DBFZFolder == undefined) topText.innerHTML = "<- Click The F!";