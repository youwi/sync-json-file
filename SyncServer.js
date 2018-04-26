var PORT = 8101;

var http = require('http');
var url = require('url');
var fs = require('fs');

var path = require('path');
var mine = {
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
var server = http.createServer(function (request, response) {

  if (request.method === "GET") {
    doGET(request, response)
  } else if (request.method === "POST") {
    doPOST(request, response)
  }else if(request.method==="DELETE"){
    doDelete(request,response)
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
    fs.exists("data",(exist)=>{
      if(!exist) fs.mkdir("data")
      fs.exists(realPath + ".json",(fileexist)=>{
        if(!fileexist) fs.writeFile(realPath + ".json", "{}")
      })
    })
    var oriObject = MEM_OBJECTS[realPath]
    try{
      if (oriObject == null) oriObject = JSON.parse(fs.readFileSync(realPath + ".json"))
    }catch (e) {
      console.log(e)
      oriObject={}
    }
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
      MEM_OBJECTS[realPath] = mergeObject
      fs.writeFile(realPath + ".json", JSON.stringify(mergeObject), (err) => {
        console.log(err)
      })
    } catch (e) {
    }
    response.writeHead(200, {
      'Content-Type': "application/json"
    });
    response.write(JSON.stringify(mergeObject), "binary");
    response.end();
  });
}

/**
 * 把object 合并到文件中
 * @param {*} path
 * @param {*} object
 */
function reduceJson(file, object) {
  //TODO
}
function doDelete(equest, response) {

}