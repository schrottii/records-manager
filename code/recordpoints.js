let wordsForPlayers = ["player", "user"];

/*
record points
sortTable(generateRecordPointsTable(getRecordPoints()));
total records
sortTable(generateRecordPointsTable(getRecordPoints(true)));
*/

function getRecordPoints(countSingle = false) {
    let players = {};
    let recordCategory;
    let recordCatconfig;
    let playersColumns;
    let playersColumn = -1;

    for (let r in saveData.records) {
        recordCategory = saveData.records[r];
        recordCatconfig = saveData.catConfig[r];

        // a bit unoptimized code, but eh, it tries to find the column that has the player names
        playersColumns = recordCatconfig.header.split("!!");
        for (let h in playersColumns) {
            playersColumns[h] = playersColumns[h].trim().toLowerCase();
        }
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
            playerName = player[playersColumn].trim();
            if (playerName == "") continue;
            //console.log(pos, player);

            if (players[playerName] == undefined) players[playerName] = countSingle ? 1 : 11 - pos;
            else players[playerName] += countSingle ? 1 : 11 - pos;
            pos++;
        }
        //console.log(players);
    }

    return players;
}

function generateRecordPointsTable(recordPoints) {
    let table = [];
    for (let player in recordPoints) {
        table.push([player, recordPoints[player]]);
    }

    /*
    let table = "{|\n!Player!!Points\n|-";

    for (let player in recordPoints) {
        table += "\n|" + player + "||" + recordPoints[player];
    }
    table += "\n|}";
    */

    return table;
}