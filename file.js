const fs = require("fs");
let path = "C:/Users/Administrator/Downloads/response.json"
let data = fs.readFileSync(path,'utf-8');
data = JSON.parse(data);
let res = [];
for (const v of data.items) {
    if(!v.url.includes('illegal')){
        res.push(v);
    }
}
console.log(res);