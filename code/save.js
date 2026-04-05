// saving the record categories and the order of categories are separate, to allow for re-ordering
var saveData;

var userData = {
    selected: "",
    settings: {

    }
}

function loadSaveData() {
    if (localStorage.getItem(config.localStorageKey)) {
        saveData = JSON.parse(localStorage.getItem(config.localStorageKey).substring(config.localStorageKey.length));
        return true;
    }
    return false;
}

function loadUserData() {
    if (localStorage.getItem(config.localStorageKey + "_USER")) {
        userData = JSON.parse(localStorage.getItem(config.localStorageKey + "_USER").substring(config.localStorageKey.length));

        ui.toggleUpsideDown.checked = getSetting("upsideDown");
        ui.toggleGaps.checked = getSetting("gaps");
        return true;
    }
    return false;
}

function saveSaveData() {
    console.log("saved");
    localStorage.setItem(config.localStorageKey, config.localStorageKey + JSON.stringify(saveData));
    localStorage.setItem(config.localStorageKey + "_USER", config.localStorageKey + JSON.stringify(userData));
}

function newSaveData() {
    // structure
    saveData = {
        records: {

        },
        catConfig: {

        },
        banLists: []
    };
    //console.log(saveData);

    // get hosted data, ie settings, persists thru updates
    loadUserData();

    //console.log(saveData);

    // force hostedData onto user if it exists
    if (hostedData != undefined && hostedData.length > 3) {
        // only load records and their configs from hostedData, not the userData (selected, settings)
        // this is because on the user side it always resets, so you don't want to reset those
        let loadedSave = JSON.parse(hostedData.substring(config.localStorageKey.length));
        saveData.records = Object.assign(saveData.records, loadedSave.records);
        saveData.catConfig = Object.assign(saveData.catConfig, loadedSave.catConfig);
        //console.log(saveData);
        return true;
    }
    else {
        saveData.records = [];
        saveData.catConfig = {};
    }

    loadCategoriesFromWiki(exampleData);
    //console.log(saveData);
    return true;
}

function exportSaveData() {
    navigator.clipboard.writeText(config.localStorageKey + JSON.stringify(saveData));
    alert("copied to clipboard");
}

function importSaveData() {
    let save = prompt("Insert the code here...");
    try {
        save = save.substring(config.localStorageKey.length);
        save = JSON.parse(save);

        saveData = save;
    }
    catch {
        alert("Wrong!");
    }
}

function getSetting(name) {
    if (userData.settings != undefined && userData.settings[name] != undefined) {
        return userData.settings[name];
    }
}

function setSetting(name, value) {
    if (userData.settings == undefined) userData.settings = {};
    userData.settings[name] = value;
}

setInterval(() => saveSaveData(), 5000);