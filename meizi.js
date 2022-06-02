/*
 * 妹子图(http://mmzztt.com)下载器
 * npm install
 * node meizi.js --help
 */
//改为import
import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { load } from 'cheerio'
import fetch from 'node-fetch';
import path from 'path';
import ora from 'ora';
import fs from 'fs';
import CryptoJS from 'crypto-js';
const baseUrl = "https://mmzztt.com/photo/";
const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const headers = {
    'If-None-Match': 'W/"5cc2cd8f-2c58"',
    "Referer": baseUrl,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
}
program
    .option('-p,--page <String>', '下载的页码', '1')
    .option('-n,--number <String>', '图册的编号', '65805')
    .option('-d,--directory <String>', '文件保存目录', `${__dirname}/meizi`)
    .option('-m,--model <String>', '模特名', 'yangchenchen')
program.parse(process.argv)
const options = program.opts();
const number = options.number;
const page = options.page;
const dir = options.directory
const model = options.model

/** 节流 防止被屏蔽IP */
async function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

async function downloadImg(url, dirName) {
    try {
        let basename = new Date().getTime() + path.basename(url)
        let filePath = path.join(dirName, basename)
        let res = await fetch(url, { method: 'get', headers: headers });
        if (res.status != 200) {
            return false;
        }
        let writeStream = fs.createWriteStream(filePath)
        res.body.pipe(writeStream)
        return true;
    } catch (error) {
        console.log(error.message)
        return false;
    }
}

async function getHtml(url) {
    try {
        let response = await fetch(url, { method: 'get', headers: headers });
        let html = await response.text();
        return html;
    } catch (err) {
        throw err;
    }
}

function aesDecode(encryptedStr, pid, t) {
    let iv = "";
    for (let i = 2; i < 18; i++) {
        iv += (pid % i) % 9;
    }
    let encryptedHexStr = CryptoJS.enc.Hex.parse(encryptedStr);
    let encryptedBase64Str = CryptoJS.enc.Base64.stringify(encryptedHexStr);
    let key = CryptoJS.MD5(CryptoJS.enc.Utf8.parse(pid + t)).toString().substr(8, 16);
    key = CryptoJS.enc.Utf8.parse(key);
    let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, key, {
        iv: CryptoJS.enc.Utf8.parse(iv),
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return JSON.parse(decryptedData.toString(CryptoJS.enc.Utf8));
}

async function download(url) {
    let pid = url.split('/')[4]
    let data = await getHtml(url)
    let $ = load(data);
    let jsStr = new RegExp('view/([a-z]+).js').exec(data);
    let signStr = new RegExp('<!--([a-z0-9]+)-->').exec(data);
    let dirName = path.join(dir, $("h1[class='uk-article-title uk-text-truncate']").text());
    let imgUrl = $("img").eq(0).attr("src");
    let imgBaseUrl = imgUrl.replace(/\/[0-9a-z]+\.jpg$/, "/");
    let sign = signStr[1].substring(64);
    let js = 'abac' + jsStr[1];
    let t = CryptoJS.MD5(js).toString();
    let arr = aesDecode(sign, pid, t);
    return await dImgs(imgBaseUrl, arr, dirName);
}

async function dImgs(imgBaseUrl, arr, dirName) {
    let count = 1;
    let total = arr.length;
    const task = ora('Downloading...').start();
    const spinner = ora().start();
    spinner.info(`开始下载${total}张图片`)
    folderVerify(dirName);
    for (const v of arr) {
        let url = imgBaseUrl + v;
        let t0 = performance.now();
        let result = await downloadImg(url, dirName);
        let t1 = performance.now();
        //百分比
        let percent = (count / total * 100).toFixed(2);
        spinner.succeed(`${v} 下载成功! 耗时: ${(t1 - t0).toFixed(2)}ms, 完成${percent}%`);
        await sleep(500);
        count++;
        if (!result) {
            spinner.fail(`${url} 下载失败!`);
        }
    }
    task.succeed(`${dirName} 下载完成!`);
    return true;
}

async function getPages(url) {
    let data = await getHtml(url)
    let reg = /https:\/\/mmzztt.com\/photo\/[0-9]+/g
    let arr = [...new Set(data.match(reg))];
    return arr;
}

async function getModel(url) {
    let data = await getHtml(url)
    let reg = new RegExp(url + '/page/[0-9]+', 'g');
    let pages = [url, ...new Set(data.match(reg))];
    let arr = [];
    for (const p of pages) {
        let page = await getPages(p);
        arr = arr.concat(page)
    }
    return arr;
}

//并发下载
async function concurrentRun(fnList = [], max = 5, taskName = "未命名") {
    if (!fnList.length) return;

    const replyList = []; // 收集任务执行结果
    const count = fnList.length; // 总任务数量
    const startTime = new Date().getTime(); // 记录任务执行开始时间

    let current = 0;
    // 任务执行程序
    const schedule = async (index) => {
        return new Promise(async (resolve) => {
            const url = fnList[index];
            if (!url) return resolve();

            // 执行当前异步任务
            const reply = await download(url);
            replyList[index] = reply;
            console.log(`${taskName} 事务进度 ${((++current / count) * 100).toFixed(2)}% `);

            // 执行完当前任务后，继续执行任务池的剩余任务
            await schedule(index + max);
            resolve();
        });
    };

    // 任务池执行程序
    const scheduleList = [...new Array(max).keys()]
        .map((_, index) => schedule(index));
    // 使用 Promise.all 批量执行
    const r = await Promise.all(scheduleList);

    const cost = (new Date().getTime() - startTime) / 1000;
    console.log(`执行完成，最大并发数： ${max}，耗时：${cost}s`);
    return replyList;
}

function folderVerify(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdir(dir, "0777", function (err) {
            if (err) {
                console.log(err);
            }
        });
    }
}

async function getUrlArr(){
    let arr = [];
    if (number) {
        let url = baseUrl + number;
        arr.push(url);
    } else {
        if (model && model != '') {
            let modelUrl = baseUrl + "model/" + model;
            arr = await getModel(modelUrl);
        } else {
            let pageUrl = baseUrl + "page/" + page;
            arr = await getPages(pageUrl);
        }
    }
    return arr;
}

async function run() {
    folderVerify(dir);
    let arr = await getUrlArr();
    for (const url of arr) {
        await download(url);
    }
    console.log("=========全部下载完成=========");
};
run();