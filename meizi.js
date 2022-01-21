/*
 * 妹子图(http://mmzztt.com)下载器
 * npm install
 * node meizi.js <Id>
 */

const fs = require('fs');
const fetch = require('node-fetch');
const request = require("request");
const cheerio = require("cheerio");
const suffixStr = "abcdefghi";
const baseUrl = "https://mmzztt.com/photo/";
const headers = {
    'If-None-Match': 'W/"5cc2cd8f-2c58"',
    "Referer": baseUrl,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
}
let suffixArr = [];

// 返回后缀
function suffix() {
    var str = "";
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
    return new Promise((resolve, reject) => {
        var fName = /\d*\.jpg/.exec(url)[0];
        //解决妹子图防盗链
        var options = {
            uri: url,
            headers: headers
        };
        let writeStream = fs.createWriteStream(`${dirName}/${fName}`, { autoClose: true })
        request(options).pipe(writeStream);
        writeStream.on('finish', function () {
            resolve(`下载: ${url} 完毕！`)
        })
        writeStream.on('error', (err) => {
            reject(err)
        })
    })
}


async function download(url) {
    let response = await fetch(url, { method: 'get', headers: headers });
    if (response && response.statusCode == 200) {
        let data = await response.text();
        var $ = cheerio.load(data);
        var dirName = $("h1[class='uk-article-title uk-text-truncate']").text();
        var url = $("img").eq(0).attr("src");
        var imgBaseUrl = url.replace(/[0-9]{2}[a-i]+\.jpg$/, "");
        if (!fs.existsSync(dirName)) {
            fs.mkdir(dirName, 0777, function (err) {
                if (err) {
                    console.log(err, 22222);
                }
            });
        }
        dImgs();
        async function dImgs() {
            console.log("==================");
            for (var i = 1; i <= suffixArr; i++) {
                let message = await downloadImg(`${imgBaseUrl}${num}.jpg`, dirName);
                console.log(message);
                await sleep(2000)
            }
        }

    } else {

    }

}

const param = process.argv.splice(2);
param && function () {
    suffix();
    param.forEach(function (t, i) {
        var url = /^(http)/.test(t) ? t : baseUrl + t;
        console.log(url);
        download(url);
    });
}();