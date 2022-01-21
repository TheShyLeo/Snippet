/*
 * 妹子图(http://mmzztt.com)下载器
 * npm install
 * node meizi.js <Id>
 */

const fs = require('fs');
const fetch = require('node-fetch');
const cheerio = require("cheerio");
const path = require('path')
const suffixStr = "abcdefghi";
const baseUrl = "https://mmzztt.com/photo/";
const dir = "F:/bizhi"
const headers = {
    'If-None-Match': 'W/"5cc2cd8f-2c58"',
    "Referer": baseUrl,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
}
let suffixArr = [];

// 返回后缀
function suffix() {
    let str = "";
    for (let i = 2; i < 56; i++) {
        let ch = i > 9 ? i : '0' + i;
        for (let char of suffixStr) {
            str = ch + char
            suffixArr.push(str)
        }
    }
    return
}

/** 节流 防止被屏蔽IP */
async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function downloadImg(url, dirName) {
    let basename = new Date().getTime() + path.basename(url)
    let filePath = path.join(dirName, basename)
    console.time(basename)
    let res = await fetch(url, { method: 'get', headers: headers });
    if (res.status == 404) {
        return false;
    }
    let writeStream = fs.createWriteStream(filePath)
    writeStream.on('finish', console.timeEnd.bind(console, basename))
    res.body.pipe(writeStream)
    return true;
}

async function download(url) {
    let response = await fetch(url, { method: 'get', headers: headers });
    if (response && response.status == 200) {
        let data = await response.text();
        let $ = cheerio.load(data);
        let dirName = path.join(dir, $("h1[class='uk-article-title uk-text-truncate']").text());
        let url = $("img").eq(0).attr("src");
        let imgBaseUrl = url.replace(/[0-9]{2}[a-i]+\.jpg$/, "");
        if (!fs.existsSync(dirName)) {
            fs.mkdir(dirName, 0777, function (err) {
                if (err) {
                    console.log(err, 22222);
                }
            });
        }
        dImgs();
        async function dImgs() {
            console.log("=========开始下载=========");
            await downloadImg(url, dirName);
            await sleep(3000)
            for (let i = 0; i < suffixArr.length;) {
                let suffix = suffixArr[i];
                let flag = await downloadImg(`${imgBaseUrl}${suffix}.jpg`, dirName);
                if (flag) {
                    console.log("success");
                    i = parseInt(i / 9) * 9 + 9;
                } else {
                    i++;
                }
                await sleep(3000);
            }
        }
    } else {

    }

}

const param = process.argv.splice(2);
param && function () {
    suffix();
    param.forEach(function (t, i) {
        let url = /^(http)/.test(t) ? t : baseUrl + t;
        console.log(url);
        download(url);
    });
}();