let wordsForPlayers = ["player", "user", "participant"];

function findPlayerColumn(category = userData.selected) {
    let headers = getHeaders(category);
    // go through the columns and look
    for (let i in headers) {
        if (wordsForPlayers.includes(headers[i])) return i - 1; // return index (excluding place), 0, 1, 2, etc. but often just 0
    }
    return -1;
}

function findSorterColumn(category = userData.selected) {
    let headers = getHeaders(category);
    let sorter = saveData.catConfig[category].sorter;

    if (sorter == undefined || sorter == "") return -1;

    // go through the columns and look
    for (let i in headers) {
        if (headers[i] == sorter) return i - 1; // return index (excluding place), 0, 1, 2, etc. but often just 1 (place - player - value)
    }
    return -1;
}

function findCurrentPlayer(category = userData.selected) {
    let column = findPlayerColumn(category);
    if (column == -1) return -1;

    return saveData.records[category][editor.row - 1][column];
}

function findPlayer(searching, category = userData.selected) {
    // to find in which row the player is
    let column = findPlayerColumn(category);
    if (column == -1) return -1;

    // look through all entries, is our dearest player here?
    let player;
    for (let pl in saveData.records[category]) {
        player = saveData.records[category][pl][column];
        //console.log(pl, player);

        if (player == searching) {
            // the player is here, this is their place
            let sorterColumn = findSorterColumn(category);
            let meplace = parseInt(pl);
            let mevalue = saveData.records[category][meplace][sorterColumn];
            let theirvalue = 0;

            if (meplace == 0) return meplace; // no need to check for tie eh

            // check for ties
            while (meplace > 0) {
                theirvalue = saveData.records[category][meplace - 1][sorterColumn]; // value of 1 place higher
                if (theirvalue == mevalue) meplace -= 1; // they are the same, continue
                else break; // not same, no tie
            }
            return meplace;
        }
    }

    // not found
    return -1;
}

/*
record points
sortTable(generateRecordPointsTable(getRecordPoints()));
total records
sortTable(generateRecordPointsTable(getRecordPoints(true)));
*/

function getRecordPoints(countSingle = false, singleplayer = false, includeRP = false) {
    let players = {};
    let recordCategory;
    //let recordCatconfig;
    let playersColumns;
    let playersColumn = -1;

    for (let r in saveData.records) {
        recordCategory = saveData.records[r];
        if ((saveData.catConfig[r].isRecordPoints === "true" || saveData.catConfig[r].isRecordPoints === "total") && includeRP == false) continue;
        //recordCatconfig = saveData.catConfig[r];

        // a bit unoptimized code, but eh, it tries to find the column that has the player names
        playersColumns = getHeaders(r);
        if (playersColumns[0] == "place" || playersColumns[0] == "!place" || playersColumns[0] == "! place") playersColumns.shift();

        if (!wordsForPlayers.includes(playersColumns[playersColumn])) playersColumn = -1;
        let i = 0;
        while (playersColumn == -1 && i < wordsForPlayers.length) {
            playersColumn = playersColumns.indexOf(wordsForPlayers[i])
            i++;
        }
        if (playersColumn == -1) continue;
        //console.log(playersColumns, playersColumn);

        // calc points
        let pos = 1;
        let playerName;
        for (let player of recordCategory) {
            if (pos > 10) break; // only count top 10
            playerName = player[playersColumn];
            if (playerName === undefined) {
                console.log("undefined player: " + playerName + " in " + r);
                console.log(recordCategory);
                continue;
            }

            playerName = playerName.trim();
            if (playerName == "") continue;

            //console.log(pos, player);
            //console.log(singleplayer);

            if (singleplayer !== false) {
                //console.log(playerName, singleplayer);
                if (playerName === singleplayer) {
                    players[r] = countSingle ? 1 : 11 - pos;
                }
            }
            else {
                if (players[playerName] == undefined) players[playerName] = countSingle ? 1 : 11 - pos;
                else players[playerName] += countSingle ? 1 : 11 - pos;
            }
            pos++;
        }
        //console.log(players);
    }

    return players;
}

function generateRecordPointsTable(recordPoints) {
    // get the newly generated RP (or total records!) via the argument

    // update TABLE
    let table = [];
    for (let player in recordPoints) {
        table.push([player, recordPoints[player]]);
    }

    return table;
}