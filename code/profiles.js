var selectedPlayer = "";

function renderRightSideProfile() {
    ui.sectionTitle.innerHTML = selectedPlayer;
    ui.rightSide.innerHTML = renderPlayerBanStatus(selectedPlayer) + "<br />" + renderPlayerPoints(selectedPlayer);
}

function renderPlayerPoints(player) {
    // function to figure out all the cool statistics for a player
    // like record points, top 10/3/1 in how many, list of all records they are in

    //   basically the thing that generates record point tables, but for this 1 player only
    // v returns in the format of { categoryName: amountOfPoints, }
    let points = getRecordPoints(false, player);
    let ren = "";

    let amountOfRecords = Object.keys(saveData.records).length; // how many categories exist

    let top10 = Object.keys(points).length;
    let no1 = 0;
    let top3 = 0;
    let total = 0; // record points amount

    // reduce amount of record categories to NOT account for record point categories
    for (let cat in saveData.catConfig) {
        if (saveData.catConfig[cat].isRecordPoints === true || saveData.catConfig[cat].isRecordPoints === "total") {
            amountOfRecords -= 1;
        }
    }

    // calculate record points stuff based on the data we gathered
    for (let cat in points) {
        if (points[cat] == 10) no1++;
        if (points[cat] >= 8) top3++;
        total += points[cat];
    }

    // adding the cool data to the renderer
    ren += "Record Points: " + total + "<br />";
    ren += "on average: " + (total / amountOfRecords).toFixed(1) + " (all records) / " + (total / top10).toFixed(1) + " (top 10 records)" + "<br />";
    ren += "Top 10 in: " + top10 + " / " + amountOfRecords + "<br />";
    ren += "Top 3 in: " + top3 + " / " + amountOfRecords + "<br />";
    ren += "#1 in: " + no1 + " / " + amountOfRecords + "<br />";
    ren += "<hr />";

    // list of all categories they are in
    ren += "<br />All categories:<table>";
    for (let cat in points) {
        ren += "<tr><td>" + saveData.catConfig[cat].name + ": </td><td>" + points[cat] + " point" + (points[cat] != 1 ? "s" : "") + "</td><td>(" + (11 - points[cat]) + ". place)</td></tr>";
    }
    ren += "</table>";

    // list of categories they are the NUMBER ONE in
    ren += "<br />#1 categories:<ul>";
    for (let cat in points) {
        if (points[cat] == 10) ren += "<li>" + saveData.catConfig[cat].name + "</li>";
    }
    ren += "</ul>";

    return ren;
}

function renderPlayerBanStatus(player) {
    let ren = "";
    let bans = [];

    for (let game of saveData.banLists) {
        if (game[1].includes(player)) bans.push(game[0]);
    }

    if (bans.length == 0) {
        ren = "Not banned anywhere";
    }
    else {
        ren = "Banned in: <ul>";
        for (let ban of bans) {
            ren += "<li>" + ban + "</li>";
        }
        ren += "</ul>";
    }

    ren += "<hr />";
    return ren;
}