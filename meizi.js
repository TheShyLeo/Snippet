/*
 * 妹子图(http://mmzztt.com)下载器
 * npm install
 * node meizi.js --help
 */

const program = require('commander')
const fetch = require('node-fetch');
const cheerio = require("cheerio");
const path = require('path')
const fs = require('fs');
const suffixStr = "abcdefghi";
const baseUrl = "https://mmzztt.com/photo/";
let suffixArr = [];
const headers = {
    'If-None-Match': 'W/"5cc2cd8f-2c58"',
    "Referer": baseUrl,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 UBrowser/6.1.2107.204 SafarMozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
}
program
    .option('-p,--page <String>', '下载的页码', '1')
    .option('-n,--number <String>', '图册的编号')
    .option('-s,--size <Integer>', '每个图册下载的数量', 100)
    .option('-d,--directory <String>', '文件保存目录', 'F:/bizhi')
    .option('-m,--model <String>', '模特名', 'yangchenchen')
program.parse(process.argv)
const options = program.opts();
const number = options.number;
const page = options.page;
const size = options.size;
const dir = options.directory
const model = options.model

// 返回后缀
function suffix() {
    let str = "";
    for (let i = 2; i <= size; i++) {
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
    try {
        let basename = new Date().getTime() + path.basename(url)
        let filePath = path.join(dirName, basename)
        console.time(basename)
        let res = await fetch(url, { method: 'get', headers: headers });
        if (res.status != 200) {
            return false;
        }
        let writeStream = fs.createWriteStream(filePath)
        writeStream.on('finish', console.timeEnd.bind(console, basename))
        res.body.pipe(writeStream)
        return true;
    } catch (error) {
        console.log(error.message)
        return false;
    }

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
                    console.log(err);
                }
            });
        }
        return await dImgs();
        async function dImgs() {
            console.log("=========开始下载=========");
            let flag = await downloadImg(url, dirName);
            if (!flag) {
                return "failed";
            }
            await sleep(1000)
            for (let i = 0; i < suffixArr.length;) {
                let suffix = suffixArr[i];
                let flag = await downloadImg(`${imgBaseUrl}${suffix}.jpg`, dirName);
                if (flag) {
                    console.log("success");
                    i = parseInt(i / 9) * 9 + 9;//成功了就跳到下一组数字
                } else {
                    if (suffix.indexOf("i") != -1) return "failed";//到i都没有数据说明没有更多的图片了
                    i++;
                }
                await sleep(1000);
            }
            return "success"
        }
    } else {
        console.log(response.status);
        return "failed"
    }
}

async function getPages(url) {
    let response = await fetch(url, { method: 'get', headers: headers });
    if (response && response.status == 200) {
        let data = await response.text();
        let reg = /https:\/\/mmzztt.com\/photo\/[0-9]+/g
        // let regP = new RegExp('[0-9]+P', 'g');
        let arr = [...new Set(data.match(reg))];
        // let p = [...new Set(data.match(regP))];
        return arr;
    } else {
        console.log(response.status);
        return [];
    }
}

async function getModel(url) {
    let response = await fetch(url, { method: 'get', headers: headers });
    if (response && response.status == 200) {
        let data = await response.text();
        let reg = new RegExp(url + '/page/[0-9]+', 'g');
        let pages = [url,...new Set(data.match(reg))];
        let arr = [];
        for (const p of pages) {
            let page = await getPages(p);
            arr = arr.concat(page)
        }
        return arr;
    } else {
        console.log(response.status);
        return [];
    }
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

async function run() {
    suffix();//初始化后缀
    let arr = [];
    if (number) {
        let url = baseUrl + number;
        arr.push(url);
    } else {
        if (model) {
            let modelUrl = baseUrl + "model/" + model;
            arr = await getModel(modelUrl);
        }else{
            let pageUrl = baseUrl + "page/" + page;
            arr = await getPages(pageUrl);
        }
    }
    // let reply = await concurrentRun(arr, 3, "下载图片");
    for (const url of arr) {
        let reply = await download(url);
        console.log(reply)
    }
};
run();