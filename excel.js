const Excel = require('exceljs')
const excelfile = "./bbb.xlsx";  //这是要导入的.xlsx文件的路径
const file = "./ccc.xlsx";  //这是要输出的.xlsx文件的路径
let workbook = new Excel.Workbook();
let pi = 3.1415926535897932384626;
let a = 6378245.0;
let ee = 0.00669342162296594323;

async function test(){
    await workbook.xlsx.readFile(excelfile);
    let worksheet = workbook.getWorksheet(1); //获取第一个worksheet
    let rowCount = worksheet.actualRowCount;
    for (let i = 3; i <= rowCount; i++) {
        let row = worksheet.getRow(i);
        let latitude = row.getCell(2).value;
        let longitude = row.getCell(3).value;
        let reverse = gps84_To_Gcj02(latitude, longitude);
        row.getCell(2).value = reverse.lat;
        row.getCell(3).value = reverse.lon;
    }
    workbook.xlsx.writeFile(file);
}
test();


// workbook.xlsx.readFile(excelfile).then(function () {
//     let worksheet = workbook.getWorksheet(1); //获取第一个worksheet
//     let rowCount = worksheet.actualRowCount;
//     for (let i = 3; i <= rowCount; i++) {
//         let row = worksheet.getRow(i);
//         let latitude = row.getCell(2).value;
//         let longitude = row.getCell(3).value;
//         let reverse = gps84_To_Gcj02(latitude, longitude);
//         row.getCell(2).value = reverse.lat;
//         row.getCell(3).value = reverse.lon;
//     }
//     workbook.xlsx.writeFile(file);
// });


function gps84_To_Gcj02(lat, lon) {
    let dLat = transformLat(lon - 105.0, lat - 35.0);
    let dLon = transformLon(lon - 105.0, lat - 35.0);
    let radLat = lat / 180.0 * pi;
    let magic = Math.sin(radLat);
    magic = 1 - ee * magic * magic;
    let sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
    dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
    let mgLat = lat + dLat;
    let mgLon = lon + dLon;
    return { lat: mgLat, lon: mgLon };
}

function transformLat(x, y) {
    let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y
        + 0.2 * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
    return ret;
}

function transformLon(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
        * Math.sqrt(Math.abs(x));
    ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
        * pi)) * 2.0 / 3.0;
    return ret;
}