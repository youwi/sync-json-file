var PORT = 8101;

var http = require('http');
var url=require('url');
var fs=require('fs');
var mine=require('./mine').types;
var path=require('path');

var server = http.createServer(function (request, response) {


    if(request.method=="GET"){
        doGET(request, response)
    }else if(request.method=="POST"){
        doPOST(request, response)
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
    var realPath = path.join("data", pathname)+".json";

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
 * 把提交的内容合并到原文件
 * @param request
 * @param response
 */
function doPOST(request, response){
    var pathname = url.parse(request.url).pathname;
    var realPath = path.join("data", pathname);
    var post= '';
    request.on('data',(chunk)=>{
        post+=chunk;
    });
    request.on('end',()=>{
        //将字符串变为json的格式
        if(!fs.existsSync("data")){
            fs.mkdirSync("data")
        }
        if(!fs.existsSync(realPath+".json")){
            fs.writeFileSync(realPath+".json","{}")
        }
        var ori= fs.readFileSync(realPath+".json")
        var oriObject=JSON.parse(ori)
        var newObject=JSON.parse(post)
        var mergeObject=Object.assign(oriObject,newObject)
        fs.writeFileSync(realPath+".json",JSON.stringify(mergeObject))
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
function reduceJson(file,object){

}