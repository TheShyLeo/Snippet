'use strict';

const fs = require("fs");
const iconv = require("iconv-lite");

let data;
let filePath = 'E:\\BaiduNetdiskDownload\\赘婿出山.txt'
let path = 'E:\\BaiduNetdiskDownload'

function getNovels(dirPath) {
    const files = fs.readdirSync(dirPath);
    let res = [];
    for (const v of files) {
        if (v.includes('.txt')) {
            let obj = {};
            obj.name = v.slice(0, v.lastIndexOf('.'));
            obj.path = dirPath + "\\" + v;
            res.push(obj);
        }
    }
}

function read(dir) {
    return new Promise((resolve, reject) => {
        fs.readFile(dir, 'utf-8', (err, data) => {
            if (err) {
                reject(console.log(err))
            } else {
                resolve(data)
            }
        })
    })
}


async function readFile(filePath, type) {
    if (data) return data;
    if (filePath === "" || typeof (filePath) === "undefined") {
        return "请选择TXT小说路径"
    }

    try {
        data = await read(filePath);
        // data = fs.createReadStream(filePath, { start: 0, end: 100, encoding: 'utf-8' });
        // data.on('data', function(chunk) {
        //     data += chunk;
        //  });
         
        //  data.on('end',function(){
        //     console.log(data);
        //  });

        // if (type === '1') {
        //     data = iconv.decode(data, 'gb2312');
        // } else {
        //     data = iconv.decode(data, 'utf-8');
        // }
    } catch (error) {
        return "TXT小说路径不存在或路径不正确"
    }

    return data.toString().replace(/\n/g, "").replace(/\r/g, "").replace(/\s+/g, " ");
}
// 提取小说名
function get_novelName(filePath) {
    var index = filePath.lastIndexOf("\\"); // 获取路径最后一个单元的序号
    var name = filePath.slice(index + 1); // 切割获得最后一个单元
    index = name.lastIndexOf("."); // 找准.号切割
    name = name.slice(0, index);  // 切割出文件名
    return name; // 返回文件名
}
// 小说文件解码操作
function fileType(buffer) {
    if (buffer[0] == 0xff && buffer[1] == 0xfe) {
        return 'utf16'
    } else if (buffer[0] == 0xfe && buffer[1] == 0xff) {
        return 'utf16'
    } else if (buffer[0] == 0xef && buffer[1] == 0xbb) {
        return 'utf8'
    } else {
        return 'GBK'
    }
}

// 判断是不是数字
function isNumber(char) {
    if (char == '1' || char == '一') return true;
    else if (char == '2' || char == '二') return true;
    else if (char == '3' || char == '三') return true;
    else if (char == '4' || char == '四') return true;
    else if (char == '5' || char == '五') return true;
    else if (char == '6' || char == '六') return true;
    else if (char == '7' || char == '七') return true;
    else if (char == '8' || char == '八') return true;
    else if (char == '9' || char == '九') return true;
    else if (char == '0' || char == '零') return true;
    else if (char == '十') return true;
    else if (char == '百') return true;
    else if (char == '千') return true;
    else if (char == '万') return true;
    else return false;
}

// 小说章节切割函数
function novel_slice(text) {
    var result = new Array();
    var i = 0;
    while (i < text.length) {
        // 提取标题
        if (text[i] == "第") {
            var caption = "第";
            var j = i + 1; // 切换到数字
            if (j >= text.length) break; // 容错处理
            while (isNumber(text[j])) {
                caption += text[j];
                j++; if (j >= text.length) break; // 容错处理
            }
            if ((j >= text.length) && (j + 1 >= text.length)) break; // 容错处理
            if ((text[j] == "章" || text[j] == "节" || text[j] == "回") && (text[j + 1] == " ")) { // 说明的确是标题了，如果不是的话，算入正文
                caption += text[j];
                i = j + 1; // 接下来进行章节名的获取，从这里开始，到找到一个有回车或者空格的段落结束
                if (i >= text.length) break; // 容错处理
                while (text[i] == " ") { // 因为可能是个空格，应该直到没有空格结束
                    caption += text[i];
                    i += 1;
                    if (i >= text.length) break; // 容错处理
                }
                while ((text[i] != " ") && (text[i] != "\n")) { // 现在不是空格了，这时候要判断是空格的时候结束
                    caption += text[i];
                    i += 1;
                    if (i >= text.length) break; // 容错处理
                }
                var content = ""; // 下面就是内容获取
                var position = i;
                // while (i < text.length) {
                //     if (i + 1 >= text.length) break; // 容错处理
                //     if (text[i + 1] == "第") { // 用于判断是不是标题，+1的目的是为了下面的i+=1设定的
                //         if (i + 2 >= text.length) break; // 容错处理
                //         var j = i + 2; while (isNumber(text[j])) {
                //             j += 1;
                //             if (j >= text.length) break; // 容错处理
                //             if (j + 1 >= text.length) break; // 容错处理
                //         } // 搜集里面的数字
                //         if ((text[j] == "章" || text[j] == "节" || text[j] == "回") && (text[j + 1] == " ")) { break; }
                //     } // 表明的确是标题，break掉
                //     content += text[i];
                //     i += 1;
                // }
                var chapter = { caption: caption, /* content: content, */length:position/15};
                result[result.length] = chapter;
            }
            else { }// 如果不是'章'的话，说明那就不是标题，而是一段文本，在这种情况下，这种文本不能算入章节中的，应该舍弃不要
        }
        i += 1; // 用于找标题的一直递增
    }
    return result;
}
async function main() {
    let time1 = new Date().getTime();
    let text = await readFile(filePath, '0');
    let time2 = new Date().getTime();
    console.log(time2 - time1);

    let res = novel_slice(text);
    let cost = new Date().getTime() - time2;
    console.log(res);
    console.log(cost);
    console.log(6438/15);
}
// function main1() {
//     main()
// }
main();
// getNovels(path);
