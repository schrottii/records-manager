var selectedBanList = 0;

function renderBanLists() {
    ui.banListsArea.style.display = "";



    let ren = "";
    for (let but in saveData.banLists) {
        ren += "<button style='" + (but == selectedBanList ? "background-color: red;" : "") + "' onclick=selectBanList(" + but + ")>" + saveData.banLists[but][0] + "</button>";
    }

    if (config.editorMode) ren += "<button onclick=newBanList()>Create new</button>";
    ui.banListsButtons.innerHTML = ren;



    renderBanListContent();
}

function renderBanListContent() {
    let ren = "";
    if (saveData.banLists[selectedBanList] != undefined) {
        ren += "<ul style='width: 400px; margin: auto; text-align: left;'>";
        for (let cheater of saveData.banLists[selectedBanList][1]) {
            ren += "<li>" + cheater + "</li>";
        }
        ren += "</ul>";
    }

    if (config.editorMode) {
        ren += "<button onclick=banListPlayerAdd()>Add Player</button>";
        ren += "<button onclick=banListPlayerRemove()>Remove Player</button>";
        ren += "<button onclick=banListPlayerLoadFromWiki()>Load from Wiki</button>";
    }
    ui.banListContent.innerHTML = ren;
}

function selectBanList(id) {
    selectedBanList = id;
    renderBanLists();
}

function newBanList() {
    let name = prompt("Name? (Ideally same as category/tree)");
    if (name == null || name == "") return false;

    saveData.banLists.push([name, []]);
    selectedBanList = saveData.banLists.length - 1;
    renderBanLists();
}

function banListPlayerAdd() {
    let name = prompt("Name?");
    if (name == null || name == "") return false;

    // unshift because newest at the top
    saveData.banLists[selectedBanList][1].unshift(name);
    renderBanListContent();
    return true;
}

function banListPlayerRemove() {
    let name = prompt("Name?");
    if (name == null || name == "") return false;

    let index = saveData.banLists[selectedBanList][1].indexOf(name);
    if (index == -1) return false;
    saveData.banLists[selectedBanList][1].splice(index, 1);
    renderBanListContent();
    return true;
}

function banListPlayerLoadFromWiki() {
    if (saveData.banLists[selectedBanList][1].length > 0) {
        let conf = confirm("This will override the players in this ban list");
        if (conf == false) return false;
    }

    let data = prompt("Put data from wiki here (list format):");
    if (data == null || data == "") return false;
    data = data.split("*");
    for (let d in data) {
        data[d] = data[d].trim();
        if (data[d] == "") data.splice(d, 1);
    }

    saveData.banLists[selectedBanList][1] = data;
    renderBanListContent();
    return true;
}