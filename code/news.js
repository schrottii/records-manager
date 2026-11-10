// enum-like, looks a bit weird, but an array wouldnt work with IntelliSense... important stability, seeing what values are needed
const NewsTypes = {
    "EditCell": (category, player, row, column, previousValue, newValue) => postNews("EditCell", [category, player, row, column, previousValue, newValue]),
    "DeletePlayer": (player, count, categoriesString) => postNews("DeletePlayer", [player, count, categoriesString]),
    "MoveCategory": (category, previousTop, newTop) => postNews("MoveCategory", [category, previousTop, newTop]),
    "EditCatConfig": (category, type, previousValue, newValue) => postNews("EditCatConfig", [category, type, previousValue, newValue]),
    "CreateCategory": (category) => postNews("CreateCategory", [category]),
    "BanlistCreate": (banlist) => postNews("CreateBanlist", [banlist]),
    "BanlistAddPlayer": (banlist, player) => postNews("BanlistAddPlayer", [banlist, player]),
    "BanlistRemovePlayer": (banlist, player) => postNews("BanlistRemovePlayer", [banlist, player]),
    "RecordPoints": (category, before, after) => postNews("RecordPoints", [category, before, after]),
    //"": () => postNews("", []),
}

const ShowNews_CategoryBased = ["EditCell", "RecordPoints"];
const ShowNews_General = ["DeletePlayer"];
const ShowNews_Technical = ["MoveCategory", "EditCatConfig", "CreateCategory", "BanlistCreate", "BanlistAddPlayer", "BanlistRemovePlayer"];

function postNews(newsType, data) {
    if (saveData.news == undefined) saveData.news = [];
    if (NewsTypes[newsType] == undefined || data == undefined) return false;

    /*
    switch (newsType) {
        case "EditCell":
            break;
        default:
            return false;
    }
    */

    // just post the stuff... processing done when reading, to keep file size small
    saveData.news.push({
        type: newsType,
        data: data
    });
}

function getNews(newsType, data) {
    try {
        switch (newsType) {
            case "EditCell":
                // category, player, row, column, previousValue, newValue
                //saveData.catConfig[data[0]].name + ": "
                if (data[4].includes("[")) data[4] = data[4].split("[")[1].split(" ")[1].split("]")[0];
                if (data[5].includes("[")) data[5] = data[5].split("[")[1].split(" ")[1].split("]")[0];
                return "<b>" + data[1] + ":</b> "
                    + data[4] + " → " + data[5]
                    + ", place: " + (parseInt(data[2]) + 1) + " → " + (findPlayer(data[1], data[0]) + 1);

            case "DeletePlayer":
                // player, count, categoriesString
                return "<b>" + data[0] + ": DELETED</b>, "
                    + data[1] + " categor" + (parseInt(data[1]) == 1 ? "y" : "ies") + ": " + data[2].replaceAll(",", ", ");

            case "MoveCategory":
                // category, previousTop, newTop
                return "<b>" + saveData.catConfig[data[0]].name + ":</b> Moved from "
                    + saveData.catConfig[data[1]].name + " → " + saveData.catConfig[data[2]].name;

            case "EditCatConfig":
                // category, type, previousValue, newValue
                return "<b>" + saveData.catConfig[data[0]].name + ":</b> Edited config "
                    + data[1] + ": " + data[2] + " → " + data[3];

            case "CreateCategory":
                // category
                return "<b>" + saveData.catConfig[data[0]].name + " created</b>";

            case "BanlistCreate":
                // banlist
                return "<b>Ban list " + data[0] + " created</b>";

            case "BanlistAddPlayer":
                // banlist, player
                return "<b>Ban list " + data[0] + ":</b> " + (data[1].includes(",") ? data[1].replaceAll(",", ", ") : data[1]) + " added";

            case "BanlistRemovePlayer":
                // banlist, player
                return "<b>Ban list " + data[0] + ":</b> " + data[1] + " removed";

            case "RecordPoints":
                // category, before, after
                let ren = "<b>(RP) " + saveData.catConfig[data[0]].name + ":</b><table>";
                for (let d = 0; d < data[2].length; d++) {
                    if (data[1][d] == undefined || data[2][d] == undefined) continue;
                    let placeBefore = -1;
                    for (let d2 = 0; d2 < data[1].length; d2++) {
                        if (data[1][d2] != undefined && data[2][d] != undefined && data[1][d2][0] == data[2][d][0]) {
                            placeBefore = parseInt(d2) + 1;
                            break;
                        }
                    }

                    ren += "<tr style='font-style: " + (data[1][d][1] == data[2][d][1] ? "italic;" : "unset") + "'><td>"
                        + (placeBefore != -1 && placeBefore != (parseInt(d) + 1) ? placeBefore + ". → " : "")
                        + (parseInt(d) + 1) + ".</td><td>"
                        + data[2][d][0] + ":</td><td>" + data[1][d][1] + "</td><td> → </td><td>" + data[2][d][1]
                        + "</td></tr>";
                }
                ren += "</table>";
                return ren;
            default:
                return "";
        }
    }
    catch (e) {
        console.log("getNews: " + data);
        console.log(e);
        return "";
    }
}

function deleteNews(stringified) {
    if (saveData.news == undefined || stringified == undefined) return false;

    let index = -1;
    for (let i = 0; i < saveData.news.length; i++) {
        if (JSON.stringify(saveData.news[i]) == stringified) {
            index = i;
            break;
        }
    }
    if (index == -1) {
        console.log("Could not find news to delete: " + stringified);
        return;
    }

    console.log("Deleting news " + (index + 1) + "/" + saveData.news.length);
    saveData.news.splice(index, 1);
    showNews(); // re-render
}

function clearNews() {
    saveData.news = [];

    console.log("Deleting all news");
    showNews();
}

function showNews() {
    if (saveData.news == undefined) saveData.news = [];
    let render = (config.editorMode ? "<button onclick='clearNews();'>Clear news (" + saveData.news.length + ")</button><br />" : "")
        + "<div style='text-align: left; float: left; margin-left: 10%; width: 80%; background-color: rgba(0, 0, 0, 0.2)'>";

    let renderNews = JSON.parse(JSON.stringify(saveData.news));
    let categoryTypeCounter = 0; // relevant for headers, only counts up if something is found
    let neu; // not just an index but a replacement for (let n of)

    // record-bound news first
    for (let cat in saveData.records) {
        //render = render + JSON.stringify(neu);
        //console.log(cat, renderNews.length);
        if (categoryTypeCounter > 0) render += "</ul>";
        categoryTypeCounter = 0;

        // which news belong to this category?
        for (let n = 0; n < renderNews.length; n++) { // not using "in" for n -= 1
            neu = renderNews[n];
            //console.log(cat, n, neu, neu.data[0] == cat);

            // it's a match - this news is from this category
            if (ShowNews_CategoryBased.includes(neu.type) && neu.data[0] == cat) {
                // counter - used to only put the name when it's the first, that's all
                if (categoryTypeCounter == 0) render += "<b>" + saveData.catConfig[cat].name + ":</b><br /><ul style='margin: unset; width: 80%;'>";
                categoryTypeCounter++;

                // add the entry 
                render += "<li>" + "<button onclick='deleteNews(`" + JSON.stringify(neu) + "`)'><big>X</big></button>"
                    + getNews(neu.type, neu.data) + "</li>";

                // then yeetus deletus (to save processing speed on future categories)
                renderNews.splice(n, 1);
                n -= 1;
            }
        }
    }

    // General
    render += "<br /><br />";
    render += "<b>General changes:</b><br /><ul style='margin: unset; width: 80%;'>";
    for (let n = 0; n < renderNews.length; n++) {
        neu = renderNews[n];

        if (ShowNews_General.includes(neu.type)) {
            render += "<li>" + "<button onclick='deleteNews(`" + JSON.stringify(neu) + "`)'><big>X</big></button>"
                + getNews(neu.type, neu.data) + "</li>";

            renderNews.splice(n, 1);
            n -= 1;
        }
    }
    render += "</ul>";

    // Technical
    render += "<br /><br />";
    render += "<b>Technical changes:</b><br /><ul style='margin: unset; width: 80%;'>";
    for (let n = 0; n < renderNews.length; n++) {
        neu = renderNews[n];

        if (ShowNews_Technical.includes(neu.type)) {
            render += "<li>" + (config.editorMode ? "<button onclick='deleteNews(`" + JSON.stringify(neu) + "`)'><big>X</big></button>" : "")
                + getNews(neu.type, neu.data) + "</li>";

            renderNews.splice(n, 1);
            n -= 1;
        }
    }
    render += "</ul>";

    render += "</div>"
    ui.rightSide.innerHTML = render;
    ui.sectionTitle.innerHTML = "News";

    ui.editorAreaRow.innerHTML = "";
    ui.editorAreaCategory.innerHTML = "";
    ui.editorAreaCalc.innerHTML = "";
}

function recordPointsNews(before, category) {
    if (saveData.news == undefined) saveData.news = [];
    before = JSON.parse(before);
    let after = JSON.parse(JSON.stringify(saveData.records[category]));

    // only once per category
    // so here we check if it already exists and then take its before (!), delete it, take over the world
    let tookFirstOldBefore = false;
    for (let n = 0; n < saveData.news.length; n++) {
        if (saveData.news[n].type == "RecordPoints" && saveData.news[n].data[0] == category) {
            // only take the oldest "before" we can find
            if (tookFirstOldBefore == false) before = saveData.news[n].data[1];
            tookFirstOldBefore = true;

            // delete no matter what
            saveData.news.splice(n, 1);
            n -= 1;
        }
    }
    
    //console.log(before, after);
    NewsTypes.RecordPoints(category, before, after);
}