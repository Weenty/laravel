const XlsxPopulate = require('xlsx-populate');
const fs = require("fs");
class WeeksDateError extends Error {
    constructor(message) {
        super(message);
        this.name = "WeeksDateError";
    }
}

function parseExcel() {
    sheetJson = {}
    fs.readdir('./public/schedule/', (err, files) => {
        files.forEach(async file => {
            console.log(file)
            if (/(.+)\.xlsx/.test(file)) {
                await XlsxPopulate.fromFileAsync("./public/schedule/" + file)
                    .then(workbook => {
                        const first_week = workbook.sheet(0).cell("C6").value();
                        const second_week = workbook.sheet(0).cell("C7").value();
                        if (first_week == undefined || second_week == undefined) {
                            throw new WeeksDateError("Не удалось распознать дни недели в Экселе.")
                        }
                        for (let i = 0; workbook.sheet(i) !== undefined; i++) {
                            let sheet = workbook.sheet(i)
                            let groups = getGroups(sheet)
                            sheetJson = getPairs(sheet, groups, sheetJson)
                        }
                        fs.writeFileSync('./public/schedule/data.json', JSON.stringify(sheetJson));
                    });
            }
        });
    })
    return sheetJson
}


function getGroups(sheet) {
    let groups = []

    for (let g = 3; ; g++) {
        const groupCell = sheet.row(10).cell(g)
        if (JSON.stringify(groupCell.style("border")) == '{}') {
            break
        }
        if (groupCell.value() !== undefined) {
            groups.push({
                "group": groupCell.value(),
                "number": groupCell.columnNumber()
            })
        }
    }
    return groups
}

function getPairs(sheet, groups, sheetJson) {

    for (let group = 0; group < groups.length; group++) {
        let nameGroup = groups[group].group
        sheetJson[nameGroup] = {}
        let numberPair = 11
        for (let day = 1; day <= 6; day++) {
            sheetJson[nameGroup][day] = []
            for (; ;) {
                pair = {
                    "status": SetStatusWeek(sheet, sheet.row(numberPair).cell(groups[group].number).style('fill').color),
                    "lesson": sheet.row(numberPair).cell(groups[group].number).value(),
                    "fo": sheet.row(numberPair).cell(groups[group].number + 1).value(),
                    "teacher": sheet.row(numberPair).cell(groups[group].number + 2).value()
                }
                if (sheet.row(numberPair).cell(groups[group].number).value() !== undefined && sheet.row(numberPair + 1).cell(groups[group].number).value() !== undefined) {
                    pair = {
                        1: {
                            "status": SetStatusWeek(sheet, sheet.row(numberPair).cell(groups[group].number).style('fill').color),
                            "lesson": sheet.row(numberPair).cell(groups[group].number).value(),
                            "fo": sheet.row(numberPair).cell(groups[group].number + 1).value(),
                            "teacher": sheet.row(numberPair).cell(groups[group].number + 2).value()
                        },
                        2: {
                            "status": SetStatusWeek(sheet, sheet.row(numberPair + 1).cell(groups[group].number).style('fill').color),
                            "lesson": sheet.row(numberPair + 1).cell(groups[group].number).value(),
                            "fo": sheet.row(numberPair + 1).cell(groups[group].number + 1).value(),
                            "teacher": sheet.row(numberPair + 1).cell(groups[group].number + 2).value()
                        }
                    }
                }
                sheetJson[nameGroup][day].push(pair)

                numberPair = numberPair + 2
                if (sheet.row(numberPair).cell(1).value() !== undefined) {
                    break
                }
                if (JSON.stringify(sheet.row(numberPair).cell(1).style("border")) == '{}') {
                    break
                }

            }
        }
    }
    return sheetJson
}

function SetStatusWeek(sheet, color) {
    const first_color = sheet.cell("C6").style('fill').color
    const second_color = sheet.cell("C7").style('fill').color
    if (color == undefined) {
        return "all"
    }
    if (color.theme == first_color.theme && color.tint == first_color.tint) {
        return "first"
    }
    if (color.theme == second_color.theme && color.tint == second_color.tint) {
        return "second"
    }
}

async function getSchedule(group) {
    // parseExcel()
    return await JSON.parse(fs.readFileSync('./public/schedule/data.json', 'utf8'))[group];
}

module.exports = {
    getSchedule: getSchedule
}