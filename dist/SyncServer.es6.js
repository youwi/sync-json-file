import { exists, readFile, mkdir, writeFile, readFileSync } from 'fs';
import { join, extname } from 'path';
import { parse } from 'url';
import { createServer } from 'http';

var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		Object.keys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	Object.keys(source).forEach(function(key) {
		if (!options.isMergeableObject(source[key]) || !target[key]) {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		} else {
			destination[key] = deepmerge(target[key], source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

/**
 * 判断对象是否相等
 */
//import  {deepmerge} from "./MergeDeep"
//import deepmerge_1 from "deepmerge"

function isEqualObject(ori, obj) {
  return JSON.stringify(ori) === JSON.stringify(obj);
}


const SAVE_DATA_TASK_LIST = [
  //{
  //	fileName:"",
  //	content:null,
  //	timeAt:null
  // }
];

/**
 * 合并大json,要注意去重,去重之后还要保持有序.
 * @param oriObject
 * @param newObject
 * @return {*}
 */
function  mergeBigObject(oriObject,newObject){
  return  deepmerge_1(oriObject, newObject,{
    arrayMerge:arrayMerge
  })
}

/**
 * 插入过程中要保持有序
 * [1,2,   ,4,5] + [1,2,3]  ==>[1,2,3,4,5]
 */
function arrayMerge(target, source, options) {
  let dict1=arrayToDict(target,"id");
  let dict2=arrayToDict(source,"id");
  if(dict1['undefined']) return target.concat(source)
  let dict3=Object.assign(dict1,dict2);
  return dictToArray(dict3)
}


/**
 * 每5秒执行一次保存任务
 */
function every5secondTask() {
  let OBJ = {
    //fileName:{fileName,content,timeAt}
  };
  SAVE_DATA_TASK_LIST.map((item) => {
    let ori = OBJ[item.fileName];
    if (ori == null) {
      OBJ[item.fileName] = item;
    } else {
      if (item.timeAt >= ori.timeAt) {
        OBJ[item.fileName] = item;
      }
    }
  });
  SAVE_DATA_TASK_LIST.length = 0;// = []
  for (let name in OBJ) {
    let startTime = new Date();
    // 这里磁盘IO瞬间上升, 不要用于生产环境!容易奔溃的.
    writeFile(name, OBJ[name].content, (err) => {
      let endTime = new Date();
      let spendTime = endTime.getTime() - startTime.getTime();
      console.log("save file " + name + ",time spend:" + spendTime + "ms," + formatDateTime(endTime));
      if (err) {
        console.log(err);
      }
    });
  }
}

function saveData(fileName, content) {
  // console.log("task:"+fileName+Date())
  SAVE_DATA_TASK_LIST.push({fileName, content, timeAt: new Date().getTime()});
}

/**
 * 日志专用
 * @param inputTime
 * @return {string}
 */
function formatDateTime(inputTime) {
  let date = new Date(inputTime);
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  let d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  let h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  let minute = date.getMinutes();
  let second = date.getSeconds();
  let msecond = date.getMilliseconds();
  minute = minute < 10 ? ('0' + minute) : minute;
  second = second < 10 ? ('0' + second) : second;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second + "." + msecond;
}/**
 * build dict for array
 * exmple
 * [{id:1},{id:2},{id:3},{id:4}]==>{1:{id:1},2:{id:2},3:{id:3},4:{id:4}}
 * @param {array} array
 * @param {string} name
 */
function arrayToDict(array, name) {
  let out = {};
  array.map(item => {
    out[item[name]] = item;
  });
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

/**
 * GET请求直接返回文件
 * @param request
 * @param response
 */
// 竟然 名称来有后缀!!

const MIME = {
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

function doGET(request, response) {
  let pathname = parse(request.url).pathname;
  let realPath = join("data", pathname) + ".json";

  exists(realPath, function (exists$$1) {
    if (!exists$$1) {
      response.writeHead(404, {
        'Content-Type': 'application/json'
      });

      response.write("This request URL " + pathname + " was not found on this server.");
      response.end();
    } else {
      readFile(realPath, "binary", function (err, file) {
        if (err) {
          response.writeHead(500, {
            'Content-Type': 'text/plain'
          });
          response.end("");
        } else {
          let ext = extname(realPath);
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
const MEM_OBJECTS = {};

/**
 * 把提交的内容合并到原文件
 * @param request
 * @param response
 */
function doPOST(request, response) {
  let pathname = parse(request.url).pathname;
  let realPath = join("data", pathname);
  let post = '';
  request.on('data', (chunk) => {
    post += chunk;
  });
  request.on('end', () => {
    //将字符串变为json的格式
    exists("data", (exist) => {
      if (!exist) mkdir("data");
      exists(realPath + ".json", (fileExist) => {
        if (!fileExist) writeFile(realPath + ".json", "{}", (e) => {
          e && console.log(e);
        });
      });
    });
    let oriObject = MEM_OBJECTS[realPath];
    try {
      if (oriObject == null) oriObject = JSON.parse(readFileSync(realPath + ".json"));
    } catch (e) {
      console.log(e);
      oriObject = {};
    }
    const backObject = Object.assign({}, oriObject);
    let newObject = {};
    try {
      newObject = JSON.parse(post);
    } catch (e) {
      console.log(e);
      console.log("maybe not json");
    }
    // 注意  Object.assign([1,2],[3,4])  ==>[3,4]不能合并
    // let mergeObject = Object.assign(oriObject, newObject)
    let mergeObject = mergeBigObject(oriObject, newObject);
    //deepmerge_1({},{})
    try {
      //缓存下来.
      //需要优化,降低文件写入
      MEM_OBJECTS[realPath] = mergeObject;
      if (!isEqualObject(backObject, mergeObject)) {
        saveData(realPath + ".json", JSON.stringify(mergeObject));
        // fs.writeFile(realPath + ".json", JSON.stringify(mergeObject), (err) => {
        //   console.log(err)
        // })
      }
    } catch (e) {
      console.log(e);
    }
    response.writeHead(200, {
      'Content-Type': "application/json"
    });
    response.write(JSON.stringify(mergeObject), "binary");
    response.end();
  });
}

const PORT = 8101;

// const http = require('http');
// const url = require('url');
// const fs = require('fs');
//
// const path = require('path');

const server = createServer(function (request, response) {

  if (request.method === "GET") {
    doGET(request, response);
  } else if (request.method === "POST") {
    doPOST(request, response);
  } else if (request.method === "DELETE") ;

});
server.listen(PORT);
console.log("Server runing at port: " + PORT + ".");
setInterval(every5secondTask, 5000);
