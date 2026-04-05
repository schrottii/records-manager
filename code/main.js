////////////////////////////////////////////////
// variables
////////////////////////////////////////////////

var ui = {
    sectionTitle: document.getElementById("sectionTitle"),
    leftSide: document.getElementById("leftSide"),
    rightSide: document.getElementById("rightSide"),
    editorAreaCategory: document.getElementById("editorAreaCategory"),
    editorAreaRow: document.getElementById("editorAreaRow"),
    tabTitle: document.getElementById("tabTitle"),
    tabTitle2: document.getElementById("tabTitle2"),
    tabTitle3: document.getElementById("tabTitle3"),

    tableSearch: document.getElementById("tableSearch"),
    categoriesSearch: document.getElementById("categoriesSearch"),
    top10: document.getElementById("top10"),

    editorOnlySettings: document.getElementById("editorOnlySettings"),
    toggleUpsideDown: document.getElementById("toggleUpsideDown"),
    toggleGaps: document.getElementById("toggleGaps"),

    banListsArea: document.getElementById("banListsArea"),
    banListsButtons: document.getElementById("banListsButtons"),
    banListContent: document.getElementById("banListContent"),
};

var editor = {
    row: -1,
    category: ""
}

var catConfigs = [
    "name", "header", "sorter", "ascending", "preText", "tree", "exportRowsLimit", "isRecordPoints"
];

////////////////////////////////////////////////
// core functions
////////////////////////////////////////////////

function generateID() {
    return "" + Math.random().toString(16).slice(2);
}

function changeTheme(theme) {
    if (!config.darkModeSwitch) return false;
    setSetting("theme", theme);
    loadTheme(theme);
}

function loadTheme(theme = undefined) {
    if (theme === undefined) theme = getSetting("theme");
    if (theme === false) {
        theme = config.defaultTheme;
        setSetting("theme", theme);
    }

    document.body.style["color-scheme"] = theme;
    document.body.style["background-image"] = config.darkModeBG && theme == "dark" ? 'url("images/texture-bg-dark.png")' : 'url("images/texture-bg.png")';
}

function convertToWikitext() {
    // CRAZY TODO PLAN?: generalize this (and other way around) into the wikitext-html converter, to have wikitext-js converts
    let WIKI = ``;
    let table;
    let tconfig;
    let rowCounter;
    let treeDepth;

    let curTree = undefined;
    let prevTree = [];

    for (let tID of Object.keys(saveData.records)) {
        table = saveData.records[tID];
        tconfig = saveData.catConfig[tID];

        let rowsToExport = config.wikiExportRows == 0 ? Infinity : config.wikiExportRows;
        if (tconfig.exportRowsLimit != undefined && tconfig.exportRowsLimit != "" && tconfig.exportRowsLimit != 0) rowsToExport = tconfig.exportRowsLimit;

        //console.log(table);
        //console.log(tconfig);

        // header and pretext
        curTree = tconfig.tree != undefined ? tconfig.tree.split(".") : [];
        treeDepth = curTree.length;
        if (treeDepth > 0 && prevTree[0] != curTree[0]) WIKI = WIKI + `== ${curTree[0]} ==\n`;
        if (treeDepth > 1 && prevTree[1] != curTree[1]) WIKI = WIKI + `=== ${curTree[1]} ===\n`;
        if (treeDepth > 2 && prevTree[2] != curTree[2]) WIKI = WIKI + `==== ${curTree[2]} ====\n`;
        prevTree = curTree;

        WIKI = WIKI + `==${"=".repeat(treeDepth)} ${tconfig.name} ==${"=".repeat(treeDepth)}\n`;
        if (tconfig.preText) WIKI = WIKI + tconfig.preText + `\n`;
        WIKI = WIKI + `{| class='article-table'\n`;

        // table content 
        if (tconfig.header.substr(0, 2) == "! ") WIKI = WIKI + `${tconfig.header}\n`;
        else WIKI = WIKI + `! ${tconfig.header}\n`;

        rowCounter = 1;
        for (let row of table) {
            if (rowCounter > rowsToExport) break;
            WIKI = WIKI + `|-\n`;
            for (let e in row) {
                if (e == 0) WIKI = WIKI + `| ${rowCounter}. || ${row[e]} `;
                else WIKI = WIKI + `|| ${row[e]} `;
            }

            WIKI = WIKI + `\n`;
            rowCounter++;
        }

        // end
        WIKI = WIKI + `|}\n\n`;
    }

    console.log(WIKI);
}

function sortableValue(v) {
    // takes care of various values to sort by, ie time, high numbers
    // this is purely internal and should not be returned to render
    if (v == undefined) return v;
    if (typeof (v) != "string") v = "" + v;

    v = v.replaceAll(",", "");
    //v = v.replaceAll(".", "");

    // has link
    if (v.includes("http")) {
        v = v.trim();
        v = v.substr(v.indexOf(" ")).trim();
        if (v.includes("]")) v = v.substr(0, v.indexOf("]"));
    }

    // time
    if (v.toLowerCase().includes("hour")) {
        if (v.toLowerCase().includes("min")) {
            if (v.split(" ").length > 3) {
                v = v.split(" "); // 69 hours 30 mins -> 60,hours,30,mins
                let h = parseInt(v[0]) * 60;
                v = h + parseInt(v[2]);
            }
            else {
                v = v.split("h"); // still catches the hour
                let h = parseInt(v[0]) * 60;
                v = h + parseInt(v[1]);
            }
        }
        else {
            return parseInt(v) * 60;
        }

        return parseInt(v);
    }
    else if (v.toLowerCase().includes("min")) return parseInt(v);

    // normal notation numbers
    let normalNotation = "kMBTQqSsOND".split("");
    if (normalNotation.includes(v.trim().substr(-1))) {
        let index = normalNotation.indexOf(v.trim().substr(-1));
        let e = Math.pow(1000, index + 1); // +1 cuz index starts at 0 (K = 0)

        if (v.includes(".")) v = parseFloat(v);
        else v = parseInt(v);

        v = v * e;
        return v;
    }

    // return other
    if (v.substr(0, 1) == "e") v = v.substr(1);
    return parseInt(v);
}

function toggleUpsideDown() {
    setSetting("upsideDown", ui.toggleUpsideDown.checked);
    sortTable();
}

function toggleGaps() {
    setSetting("gaps", ui.toggleGaps.checked);
    renderRightSide();
}

////////////////////////////////////////////////
// loading and converting
////////////////////////////////////////////////

function loadCategoryFromWiki(wikiContent) {
    // sub function for loadCategoriesFromWiki
    // loads the values of the player's records
    let wikiLines = wikiContent.split("\n");
    let content = [];
    let contentPush = [];
    let multiLiner = false;
    let lineSplit;
    let last;

    // go through the lines of a table (|, ||)
    for (let line of wikiLines) {
        if ((line.includes("||") || line.substr(0, 2) == "| ") && !line.includes("|-")) {
            // separates the values
            lineSplit = line.split("||");

            // removes first if it's 1., 2., 3. etc.
            if (lineSplit[0].trim().substr(-1) == "."
                && !lineSplit[0].includes("http")) lineSplit.shift(); // remove 1., 2., 3. (place)

            for (let e in lineSplit) {
                lineSplit[e] = lineSplit[e].trim();
                if (lineSplit[e].includes("{{exp")) lineSplit[e] = lineSplit[e].split("{{exp|")[1].split("|")[0];
                if (lineSplit[e].includes("{{Exp")) lineSplit[e] = lineSplit[e].split("{{Exp|")[1].split("|")[0];
            }

            // multiple elements in one line?
            if (lineSplit[0].substr(0, 2) == "| ") lineSplit[0] = lineSplit[0].substr(2);

            //if (lineSplit.length > 0 && lineSplit[lineSplit.length - 1].trim() == "") lineSplit.pop();
            if (line.substr(0, 2) == "||" && lineSplit[0].trim() == "") lineSplit.shift();

            if (lineSplit[0].trim() != "") {
                contentPush.push(...lineSplit);
                lineSplit = undefined;
                multiLiner = true;
            }
            else content.push(lineSplit);
        }

        if (line.includes("http") && line.substr(0, 1) == "[") { // link
            // combine existing links and latest link
            if (contentPush.length == 0) last = 0;
            else last = 1;

            if (!line.includes("||") || line.split("[http").length > 2) contentPush[contentPush.length - last] = contentPush[contentPush.length - last] + line.substr(line.indexOf("[http"));

            multiLiner = true;
            lineSplit = undefined;
        }

        if (line.includes("|-")) {
            if (multiLiner) {
                // pushes multi line content when next line begins for sure
                content.push(contentPush);
                contentPush = [];
                multiLiner = false;
            }
        }
    }

    if (multiLiner && contentPush.length > 0) {
        content.push(contentPush);
    }

    return content;
};

function loadCategoriesFromWiki(categoriesContent) {
    // takes the raw wiki data, and loads the records with their people
    // as well as the header (player name, level, etc.)

    // separates categories by == categories ==
    categoriesContent = categoriesContent.split("\n=");
    let categoryName;
    let ID;
    let categoryContent;

    for (let cat of categoriesContent) {
        if (cat.includes("|-")) {
            // not a filler headline, has a table
            categoryName = cat.split("\n")[0].replaceAll("=", "").replaceAll("[", "").replaceAll("]", "");
            categoryName = categoryName.trim();

            // generate ID (used for saving) and load the contents (rows)
            ID = generateID();
            categoryContent = loadCategoryFromWiki(cat);

            saveData.records[ID] = categoryContent;
            if (saveData.catConfig[ID] == undefined) saveData.catConfig[ID] = {};
            saveData.catConfig[ID].name = categoryName;

            // headers
            for (let cc of cat.split("\n")) {
                if (cc.includes("!!")) {
                    if (cc.includes("lace")) saveData.catConfig[ID].header = cc;
                    else saveData.catConfig[ID].header = " Place!!" + cc;
                }
            }
        }
    }
}

function createTable(name, og_content) {
    // record points format tables
    if (saveData.catConfig[name].isRecordPoints === "true") saveData.records[name] = og_content = sortTable(generateRecordPointsTable(getRecordPoints()), "manual");
    if (saveData.catConfig[name].isRecordPoints === "total") saveData.records[name] = og_content = sortTable(generateRecordPointsTable(getRecordPoints(true)), "manual");

    // turns data into a table, for rendering
    let content = [];
    for (let c of og_content) {
        content.push(Object.assign([], c));
    }

    let counter = 1;
    let table = "{|\n" + saveData.catConfig[name].header;

    let sorter = saveData.catConfig[name].sorter;
    let trimmedHeaders = saveData.catConfig[name].header.split("!!");
    for (let h in trimmedHeaders) {
        trimmedHeaders[h] = trimmedHeaders[h].trim().toLowerCase();
    }

    // gaps
    let sortID = trimmedHeaders.indexOf(saveData.catConfig[name].sorter) - 1;
    if (sortID != -1 && getSetting("gaps") == true) {
        let val;
        for (let c in content) {
            c = parseInt(c);
            if (c == content.length - 1 || content[c] == undefined || content[c][sortID] == undefined) continue;

            val = ((sortableValue(content[c][sortID]) / sortableValue(content[c + 1][sortID]) - 1) * 100).toFixed(2);
            content[c][sortID] += "<span style='float: right;'>(" + (val >= 0 ? "+" : "") + val + "%)</span>";
        }
    }

    // render - convert code to wiki (and then to html)
    let cclass = "";
    let cclick = "";

    let prevValue = "";
    let prevCount = -1;

    for (let c of content) {
        // filter/highlight color (class) change
        if (config.editorMode && editor.row == counter) cclass = "class='editing' ";
        else if (ui.tableSearch.value != "" && c.toString().toLowerCase().includes(ui.tableSearch.value.toLowerCase())) cclass = "class='golden' ";
        else if (ui.categoriesSearch.value != "" && c.toString().toLowerCase().includes(ui.categoriesSearch.value.toLowerCase().trim())) cclass = "class='highlighted' ";
        else cclass = "";

        // clickable in editor mode
        if (config.editorMode) cclick = "onclick='clickRow(" + counter + ")' ";

        // ties
        if (sorter != undefined && prevValue == c[sortID].split("<s")[0]) {
            if (prevCount == -1) prevCount = counter - 1;
        }
        else {
            prevCount = -1;
            prevValue = "";
        }

        // add content
        table = table + "\n|-\n| " + cclass + cclick
            + (prevCount != -1 ? ("=" + prevCount) : counter) + ".";
        for (let cc of c) {
            table = table + "||" + cc;
        }

        if (sorter != undefined) prevValue = c[sortID].split("<s")[0]; // also for ties

        // used for 1./2./3. and top 10 limiter
        counter++;
        if (ui.top10.checked == true && counter > 10) break;
    }
    table = table + "\n|}";

    return formatTableFromHTML(tableFromWiki(table),
        { tableClass: "tableClass", headerClass: "headerClass", rowClass: "rowClass" });
}

function showCategory(name) {
    // triggered when left side button clicked
    // changes right side to selected record category
    userData.selected = name;

    editor.row = -1;
    ui.editorAreaRow.innerHTML = "";
    editCategory();

    sortTable();
    renderRightSide();
    renderCategoriesList();
    saveSaveData();
}

////////////////////////////////////////////////
// edit row functions
////////////////////////////////////////////////

function clickRow(row) {
    // select this one
    if (!config.editorMode) return false;
    editor.row = row;

    // render cells for editing
    let render = "<h4>Edit row/submission:</h4>";

    for (let c in saveData.records[userData.selected][row - 1]) {
        render = render + saveData.catConfig[userData.selected].header.split("!!")[parseInt(c) + 1] // +1 to ignore place
            + "<input id='cell-" + c + "' onblur='editCell(" + c + ")' type='text' style='width: 75%; text-align: left;' value='"
            + saveData.records[userData.selected][row - 1][c] + "'></input><br />";
    }

    render = render + "<button onclick='deleteRow()'>Delete row</button>";
    render = render + "<button onclick='deletePlayer(`" + saveData.records[userData.selected][row - 1][saveData.catConfig[userData.selected].header.split("!!").indexOf(" Player ") - 1] + "`)'>Delete all instances of player</button>";

    ui.editorAreaRow.innerHTML = render;

    // update relevant UI
    renderRightSide();
}

function deleteRow(selTable = userData.selected, selRow = editor.row) {
    // deletes selected row
    if (!config.editorMode) return false;

    let newTable = [];
    for (let t in saveData.records[selTable]) {
        if (t != selRow - 1) {
            newTable.push(saveData.records[selTable][t]);
        }
    }

    saveData.records[selTable] = newTable;
    editor.row = -1;

    renderCategoriesList();
    renderRightSide();
}

function editCell(nr) {
    if (!config.editorMode) return false;

    saveData.records[userData.selected][editor.row - 1][nr] = document.getElementById("cell-" + nr).value;

    sortTable();
    renderRightSide();
}

function deletePlayer(player) {
    if (!config.editorMode) return false;

    let table;
    for (let t in saveData.records) {
        table = saveData.records[t];
        for (let row in table) {
            if (table[row].includes(player)) deleteRow(t, parseInt(row) + 1);
        }
    }

    // render list, right side is done by deleteRow
    editor.row = -1;
    renderCategoriesList();
}

////////////////////////////////////////////////
// category editing functions
////////////////////////////////////////////////

function editCategory(category = userData.selected) {
    if (!config.editorMode) return false;
    editor.category = category;

    let render = "<h4>Edit category:</h4><table style='width: 98%;'>";

    // render editable config for the category
    for (let cfg of catConfigs) {
        render = render + "<tr><td style='width: 30%; text-align: left;'>"
            + cfg + ":</td><td>"
            + "<input style='width: 95%;' id='cfg-" + cfg
            + "' value='" + saveData.catConfig[category][cfg]
            + "' onblur='editCategoryConfig(`" + cfg + "`)'></input></td></tr>";
    }
    render += "</table>";

    // buttons
    render = render + "<button onclick='sortTable();'>Sort table</button>";
    render = render + "<button onclick='addTableRow();'>Add row</button>";
    render = render + "<button onclick='addTableRowEmpty();'>Add empty row</button>";
    render = render + "<button onclick='copyTableID();'>Copy ID</button>";
    render = render + "<button onclick='moveTable();'>Move table</button>";

    ui.editorAreaCategory.innerHTML = render;
}

function editCategoryConfig(cfg) {
    let newValue = document.getElementById("cfg-" + cfg);
    if (newValue == "" || newValue == null) return false;
    newValue = newValue.value;
    if (newValue == "") return false;

    saveData.catConfig[editor.category][cfg] = newValue;

    if (cfg == "sorter") sortTable();
    renderRightSide();
}

function addTableRow() {
    let headers = saveData.catConfig[userData.selected].header;
    let example = [];
    if (saveData.records[userData.selected].length > 0) {
        for (let e of saveData.records[userData.selected][0]) {
            example.push(e);
        }
        if (example[example.length - 1].includes("[http")) {
            example[example.length - 1] = "images";
        }
    }
    else example = "";

    if (headers.includes("lace")) {
        headers = headers.split("lace")[1];
    }

    let input = prompt("separated by ;\n" + headers + "\n" + example);
    if (input == false || input == "" || input == undefined || !input.includes(";")) return false;
    input = input.split(";");
    if (input.length + 1 != saveData.catConfig[userData.selected].header.split("!!").length) return false;

    saveData.records[userData.selected].push(input);
    sortTable();
    renderEverything();
}

function addTableRowEmpty() {
    let emptyRow = [];
    for (let c = 0; c < saveData.catConfig[userData.selected].header.split("!!").length - 1; c++) {
        emptyRow.push("");
    }

    saveData.records[userData.selected].push(emptyRow);
    sortTable();
    renderEverything();
}

function copyTableID() {
    let ID = editor.category;
    navigator.clipboard.writeText(ID);
}

function moveTable() {
    // get the ID of the table to move next to (after)
    let ID = prompt("ID of the table that should be before it? (or, 0 = first)");
    if (ID === "" || ID === null) return false;

    // where is it?
    /*
    let i;
    for (i of Object.keys(saveData.records)) {
        if (i == ID) break;
    }
        */

    // make a new dict, re-copy everything, but re-order those two
    let movingID = editor.category;
    let movingTable = Object.assign([], saveData.records[movingID]);

    let newRecords = {};
    //console.log(ID, movingID, Object.keys(newRecords).indexOf(ID), Object.keys(newRecords).indexOf(movingID));
    //console.log(saveData.records, saveData.records.length, newRecords, newRecords.length);
    for (let table in saveData.records) {
        //console.log(table, ID, Object.keys(newRecords).length);
        if (table == ID || (ID === "0" && Object.keys(newRecords).length == 0)) {
            if (ID !== "0") newRecords[ID] = Object.assign([], saveData.records[table]);
            newRecords[movingID] = movingTable;
            console.log(newRecords);
            //console.log(newRecords[ID], newRecords[movingID]);
        }
        if (table == movingID) continue;

        if (table != undefined && table != "undefined") newRecords[table] = Object.assign([], saveData.records[table]);
    }

    // save
    saveData.records = {};
    saveData.records = newRecords;

    // render
    editor.category = userData.selected = movingID;
    renderCategoriesList();
}

function sortTable(tableID = userData.selected, sortByID = "auto") {
    let oldTable;
    let isManual = false;

    if (sortByID == "manual") {
        // directly inserts a table
        isManual = true;
        oldTable = tableID;
    }
    else {
        oldTable = saveData.records[tableID];
    }

    let newTable = [];
    let pairs = []; // each pair is: [ID, value]
    // it sorts by value, and uses the ID to place them around

    if (isManual) {
        sortByID = 1;
    }
    else if (sortByID == "auto" && saveData.catConfig[userData.selected].sorter != undefined) {
        let headers = saveData.catConfig[userData.selected].header.split("!!");
        for (head in headers) {
            headers[head] = headers[head].trim().toLowerCase();
        }
        sortByID = headers.indexOf(saveData.catConfig[userData.selected].sorter.trim().toLowerCase()) - 1;
    }
    if (sortByID == undefined) {
        // usually the right one (0 = player, 1 = value)
        sortByID = 1;
        saveData.catConfig[userData.selected].sorter = 1;
    }

    // create pairs [ID, value]
    for (let p in oldTable) {
        pairs.push([parseInt(p), sortableValue(oldTable[p][sortByID])]);
    }

    // sort
    let ascending = saveData.catConfig[userData.selected] != undefined ? saveData.catConfig[userData.selected].ascending : false;
    if (ascending == undefined || ascending == "undefined" || ascending == "false") ascending = false;
    if (ascending == "true") ascending = true;
    if (getSetting("upsideDown") == true) ascending = !ascending;

    for (let j = 0; j < pairs.length - 1; j++) {
        for (let i = j + 1; i < pairs.length; i++) {
            //console.log(pairs[i][1], pairs[j][1]);
            if (ascending == true ? pairs[i][1] < pairs[j][1] : pairs[j][1] < pairs[i][1]) {
                // swap
                if (ascending == true) {
                    // turn j to i, then i to j
                    if (editor.row - 1 == i) editor.row = j + 1;
                    else if (editor.row - 1 == j) editor.row = i + 1;

                    let temp = [pairs[j][0], pairs[j][1]];
                    pairs[j] = [pairs[i][0], pairs[i][1]];
                    pairs[i] = temp;
                }
                else {
                    // descending (default)
                    // turn i to j, then j to i
                    if (editor.row - 1 == i) editor.row = j + 1;
                    else if (editor.row - 1 == j) editor.row = i + 1;

                    let temp = [pairs[i][0], pairs[i][1]];
                    pairs[i] = [pairs[j][0], pairs[j][1]];
                    pairs[j] = temp;
                }
            }
        }
    }
    //console.log(pairs);

    // generate new Table from the swapped pairs
    for (let n in oldTable) {
        if (isManual && newTable.length == 10) break;
        newTable.push(oldTable[pairs[n][0]]);
    }

    if (isManual) return newTable;
    else saveData.records[tableID] = newTable;
    renderRightSide();
}

function createNewCategory(name) {
    let newID = generateID();
    saveData.records[newID] = [];
    saveData.catConfig[newID] = { name: name, header: "! Place !! x !! y" };
}

////////////////////////////////////////////////
// render functions
////////////////////////////////////////////////

function renderCategoriesList() {
    // renders the left side
    let render = "";
    let treeName = "";
    let treeNamePrev = "";

    // ft. search, to either search for the name, or its contents (needs to be fully spelled then)
    let filter = ui.categoriesSearch.value.toLowerCase().trim();
    let nameFilters;

    for (let ID in saveData.records) {
        if (filter != "") {
            nameFilters = [];
            for (n of saveData.records[ID]) {
                for (nn of n) {
                    nameFilters.push(("" + nn).toLowerCase().trim());
                }
            }
        }

        if (filter == ""
            || saveData.catConfig[ID].name.toLowerCase().includes(filter)
            || nameFilters.includes(filter)
        ) {
            if (saveData.catConfig[ID] == undefined) {
                console.log(ID, saveData.records[ID], saveData.catConfig[ID]);
                continue;
            }

            treeName = saveData.catConfig[ID].tree /*&& filter != ""*/ ? ("<small style='font-size: 12px; position: absolute; left: 10px; text-align: left;'>" + saveData.catConfig[ID].tree.split(".")[0] + "> </small><br />") : "";
            if (treeName == treeNamePrev && treeName != "") {
                treeNamePrev = treeName;
                treeName = "";
            }
            else treeNamePrev = treeName;

            render = render + "<button class='listButton' onclick='showCategory(`" + ID + "`)' style='position: relative; " + (userData.selected == ID ? "background-color: light-dark(rgb(255, 255, 180), rgb(0, 0, 75));" : "") + "'>" + treeName + saveData.catConfig[ID].name + "</button><br />";
        }
    }

    ui.leftSide.innerHTML = render;
}

function renderRightSide() {
    let cat = saveData.records[userData.selected];
    if (cat == undefined) return false;

    ui.sectionTitle.innerHTML = saveData.catConfig[userData.selected].name;
    ui.rightSide.innerHTML = (saveData.catConfig[userData.selected].preText ? saveData.catConfig[userData.selected].preText : "")
        + "<div class='tableContainer'>"
        + createTable(userData.selected, cat) + "</div>";
}

function renderEverything() {
    ui.tabTitle.innerHTML = config.managerTitle;
    ui.tabTitle2.innerHTML = config.managerTitle;
    ui.tabTitle3.innerHTML = config.managerTitle;

    renderCategoriesList();
    renderRightSide();

    renderBanLists();
}

function initializeManager() {
    // boots up the program
    ui.sectionTitle.innerHTML = "Select a category...";
    ui.editorOnlySettings.style.display = config.editorMode ? "" : "none";

    // load save, or create new
    if (!config.forceDataReset && loadSaveData()) {
        // loaded successfully
    }
    else {
        // create new
        newSaveData();
    }

    loadTheme();
    renderEverything();
}

initializeManager();