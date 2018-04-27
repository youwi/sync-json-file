/**
 * GET请求直接返回文件
 * @param request
 * @param response
 */
import * as path from "path";
import * as url from "url";
import * as fs from "fs";
import {saveData} from "./ObjectUtil";
import {isEqualObject} from "./ObjectUtil";
import  {deepmerge} from "./MergeDeep"
import deepmerge_1 from "deepmerge"
// 竟然 名称来有后缀!!

export const MIME = {
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

export function doGET(request, response) {
  let pathname = url.parse(request.url).pathname;
  let realPath = path.join("data", pathname) + ".json";

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
          let ext = path.extname(realPath);
          ext = ext ? ext.slice(1) : 'json';
          let contentType = MIME[ext] || "text/plain";
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
export function doPOST(request, response) {
  let pathname = url.parse(request.url).pathname;
  let realPath = path.join("data", pathname);
  let post = '';
  request.on('data', (chunk) => {
    post += chunk;
  });
  request.on('end', () => {
    //将字符串变为json的格式
    fs.exists("data", (exist) => {
      if (!exist) fs.mkdir("data")
      fs.exists(realPath + ".json", (fileExist) => {
        if (!fileExist) fs.writeFile(realPath + ".json", "{}", (e) => {
          e && console.log(e)
        })
      })
    })
    let oriObject = MEM_OBJECTS[realPath]
    try {
      if (oriObject == null) oriObject = JSON.parse(fs.readFileSync(realPath + ".json"))
    } catch (e) {
      console.log(e)
      oriObject = {}
    }
    const backObject = Object.assign({}, oriObject);
    let newObject = {}
    try {
      newObject = JSON.parse(post)
    } catch (e) {
      console.log(e)
      console.log("maybe not json")
    }
    // 注意  Object.assign([1,2],[3,4])  ==>[3,4]不能合并
    // let mergeObject = Object.assign(oriObject, newObject)
    let mergeObject = deepmerge_1(oriObject, newObject)
    //deepmerge_1({},{})
    try {
      //缓存下来.
      //需要优化,降低文件写入
      MEM_OBJECTS[realPath] = mergeObject
      if (!isEqualObject(backObject, mergeObject)) {
        saveData(realPath + ".json", JSON.stringify(mergeObject))
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


export function doDelete(request, response) {

}
