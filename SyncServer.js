const PORT = 8101;

const http = require('http');
const url = require('url');
const fs = require('fs');

const path = require('path');
const mine = {
  "css": "text/css",
  "gif": "image/gif",
  "html": "text/html",
  "ico": "image/x-icon",
  "jpeg": "image/jpeg",
  "jpg": "image/jpeg",
  "js": "text/javascript",
  "json": "application/json",
  "pdf": "application/pdf",
  "png": "image/png",
  "svg": "image/svg+xml",
  "swf": "application/x-shockwave-flash",
  "tiff": "image/tiff",
  "txt": "text/plain",
  "wav": "audio/x-wav",
  "wma": "audio/x-ms-wma",
  "wmv": "video/x-ms-wmv",
  "xml": "text/xml"
};
const server = http.createServer(function (request, response) {

  if (request.method === "GET") {
    doGET(request, response)
  } else if (request.method === "POST") {
    doPOST(request, response)
  } else if (request.method === "DELETE") {
    doDelete(request, response)
  }

});
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");

/**
 * GET请求直接返回文件
 * @param request
 * @param response
 */
function doGET(request, response) {
  var pathname = url.parse(request.url).pathname;
  var realPath = path.join("data", pathname) + ".json";

  fs.exists(realPath, function (exists) {
    if (!exists) {
      response.writeHead(404, {
        'Content-Type': 'application/json'
      });

      response.write("This request URL " + pathname + " was not found on this server.");
      response.end();
    } else {
      fs.readFile(realPath, "binary", function (err, file) {
        if (err) {
          response.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          response.end(err);
        } else {
          var ext = path.extname(realPath);
          ext = ext ? ext.slice(1) : 'json';
          var contentType = mine[ext] || "text/plain";
          response.writeHead(200, {
            'Content-Type': contentType
          });
          response.write(file, "binary");
          response.end();
        }
      });
    }
  });
}

/**
 * 内存做缓存,防止冲突
 * @type {Array}
 */
const MEM_OBJECTS = {}

/**
 * 把提交的内容合并到原文件
 * @param request
 * @param response
 */
function doPOST(request, response) {
  var pathname = url.parse(request.url).pathname;
  var realPath = path.join("data", pathname);
  var post = '';
  request.on('data', (chunk) => {
    post += chunk;
  });
  request.on('end', () => {
    //将字符串变为json的格式
    fs.exists("data", (exist) => {
      if (!exist) fs.mkdir("data")
      fs.exists(realPath + ".json", (fileexist) => {
        if (!fileexist) fs.writeFile(realPath + ".json", "{}",(e)=>{e&&console.log(e)})
      })
    })
    var oriObject = MEM_OBJECTS[realPath]
    try {
      if (oriObject == null) oriObject = JSON.parse(fs.readFileSync(realPath + ".json"))
    } catch (e) {
      console.log(e)
      oriObject = {}
    }
    const backObject = Object.assign({}, oriObject);
    try {
      var newObject = JSON.parse(post)
    } catch (e) {
      console.log(e)
      console.log("maybe not json")
      newObject = {}
    }
    var mergeObject = Object.assign(oriObject, newObject)
    try {
      //缓存下来.
      //需要优化,降低文件写入
      MEM_OBJECTS[realPath] = mergeObject
      if (!isEqualObject(backObject, mergeObject)) {
        saveData(realPath+".json",JSON.stringify(mergeObject))
        // fs.writeFile(realPath + ".json", JSON.stringify(mergeObject), (err) => {
        //   console.log(err)
        // })
      }
    } catch (e) {
      console.log(e)
    }
    response.writeHead(200, {
      'Content-Type': "application/json"
    });
    response.write(JSON.stringify(mergeObject), "binary");
    response.end();
  });
}

/**
 * 判断对象是否相等
 */
function isEqualObject(ori, obj) {
  if (JSON.stringify(ori) === JSON.stringify(obj))
    return true
  return false
}

/**
 * 把object 合并到文件中
 * @param {*} path
 * @param {*} object
 */
function reduceJson(file, object) {
  //TODO
}

function doDelete(request, response) {

}


const  SAVE_DATA_TASK_LIST = [
  //{
  //	fileName:"",
  //	content:null,
  //	timeAt:null
  // }
]
setInterval(every5secondTask, 5000)

/**
 * 每5秒执行一次保存任务
 */
function every5secondTask(){
  var OBJ = {
    //fileName:{fileName,content,timeAt}
  }
  SAVE_DATA_TASK_LIST.map((item) => {
    var ori = OBJ[item.fileName]
    if (ori == null) {
      OBJ[item.fileName] = item
    } else {
      if (item.timeAt >= ori.timeAt) {
        OBJ[item.fileName] = item
      }
    }
  });
  SAVE_DATA_TASK_LIST.length=0 ;// = []
  for (var name in OBJ) {
    var startTime = new Date()

    fs.writeFile(name, OBJ[name].content, (err) => {
      var endTime=new Date()
      var spendTime=endTime.getTime()-startTime.getTime()
      console.log("save file " + name + ",time spend:" + spendTime+"ms,"+formatDateTime(endTime))
      if(err){
        console.log(err)
      }
    })
  }
}
function saveData(fileName, content) {
  // console.log("task:"+fileName+Date())
  SAVE_DATA_TASK_LIST.push({ fileName, content, timeAt: new Date().getTime() })
}

/**
 * 日志专用
 * @param inputTime
 * @return {string}
 */
function formatDateTime(inputTime) {
  var date = new Date(inputTime);
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  var second = date.getSeconds();
  var msecond= date.getMilliseconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second+"."+msecond;
};

/**
 * 合并删除对象,要求按键删除
 * [{id:1},{id:2},{id:3},{id:4}] - {id:1} => [{id:2},{id:3},{id:4}]
 * @param {*} oriObject
 * @param {*} smallObject
 */
function deleteObject(oriArray,smallArray){
  // 假设id是唯一的
  // deleteObject([{id:1},{id:2},{id:3},{id:4}],[ {id:1}])
  var dict=arrayToDict(oriArray,"id")
  var dictSmall=arrayToDict(smallArray,"id")
  Object.keys(dictSmall).map(id=>delete dict[id])
  return Object.values(dict)
}

/**
 * build dict for array
 * exmple
 * [{id:1},{id:2},{id:3},{id:4}]==>{1:{id:1},2:{id:2},3:{id:3},4:{id:4}}
 * @param {*} object
 * @param {*} name
 */
function arrayToDict(array, name) {
  var out = {}
  array.map(item => {
    out[item[name]] = item
  })
  return out
}
/**
 * {1:{id:1},2:{id:2},3:{id:3},4:{id:4}}==>[{id:1},{id:2},{id:3},{id:4}]
 * @param {*} object
 * @param {*} name
 */
function dictToArray(object, name) {
  // arrayToDict([{id:1},{id:2},{id:3},{id:4}],"id")
  //  Object.values({1:{id:1},2:{id:2},3:{id:3},4:{id:4}})
  return Object.values(object)
}
