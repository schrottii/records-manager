function renderRightSideProfile(player = currentPlayer) {
    currentPlayer = player;

    ui.sectionTitle.innerHTML = "<button onclick='toggleFavoritePlayer();' class='favoriteButton'>" + (userData.favoriteplayers.includes(currentPlayer) ? "Rem ⭐" : "Add ⭐") + "</button> "
        + player;

    ui.rightSide.innerHTML = "<button class='favoriteButton' onclick='renderRightSide();'>Back</button>"//<br style='clear: both;' />"
        + renderPlayerBanStatus(player)
        + renderPlayerPoints(player);

    ui.editorAreaCategory.innerHTML = "";
    ui.editorAreaRow.innerHTML = "";
}

let currentPlayer = "";

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
        if (saveData.catConfig[cat].isRecordPoints === "true" || saveData.catConfig[cat].isRecordPoints === "total") {
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
    ren += "<span style='color: orange;'>Record Points: " + total + "</span><br />";
    if (total === 0) {
        ren += "<span style='color: red;'>No records / no data</span>";
        return ren;
    }

    ren += "on average: " + (total / amountOfRecords).toFixed(1) + " (all records) / " + (total / top10).toFixed(1) + " (own records)" + "<br />";
    ren += "Top 10 in: " + top10 + " / " + amountOfRecords + "<br />";
    ren += "<span style='color: silver;'>Top 3 in: " + top3 + " / " + amountOfRecords + "</span><br />";
    ren += "<span style='color: gold;'>#1 in: " + no1 + " / " + amountOfRecords + "</span><br />";
    ren += "<hr />";

    // list of all categories they are in
    let colorflick = "white";

    ren += "All categories:<table style='text-align: left; margin-left: 5%;'>";
    ren += "<tr style='color: gold;'><td>Category</td><td>Placement</td><td>Record Points</td></tr>";
    for (let cat in points) {
        ren += "<tr style='color: " + (points[cat] == 10 ? "gold" : points[cat] >= 8 ? "silver" : colorflick) + ";'><td><li>" + saveData.catConfig[cat].name + ": </li></td>"
        + "<td>" + (11 - points[cat]) + ". place</td>"
        + "<td> (" + points[cat] + " point" + (points[cat] != 1 ? "s" : "") + ")</td>"
        + "</tr>";
        colorflick = colorflick == "white" ? "rgb(222, 222, 255)" : "white";
    }
    ren += "</table>";
    ren += "<hr />";

    // list of categories they are the NUMBER ONE in
    ren += "#1 categories:<ul>";
    for (let cat in points) {
        if (points[cat] == 10) ren += "<li style='color: " + colorflick + ";'>" + saveData.catConfig[cat].name + "</li>";
        colorflick = colorflick == "white" ? "rgb(222, 222, 255)" : "white";
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

function openPlayer(player = ui.playerSearch.value) {
    if (player == "" || player == undefined || player == false) return;

    renderRightSideProfile(player);
}

function showFavoritePlayers() {
    let render = "";
    for (let playerName of userData.favoriteplayers) {
        render = render + "<button class='listButton' onclick='openPlayer(`" + playerName + "`); showFavoritePlayers();' style='position: relative; " + (currentPlayer == playerName ? "background-color: light-dark(rgb(255, 255, 180), rgb(0, 0, 75));" : "") + "'>"
            + (userData.favoriteplayers.includes(playerName) ? "<span style='float: left;'>⭐</span>" : "")
            + playerName + "</button><br />";
    }
    ui.leftSide.innerHTML = render;
}