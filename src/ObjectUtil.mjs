/**
 * 判断对象是否相等
 */
import * as fs from "fs";
import deepmerge_1 from "deepmerge";
//import  {deepmerge} from "./MergeDeep"
//import deepmerge_1 from "deepmerge"

export function isEqualObject(ori, obj) {
  return JSON.stringify(ori) === JSON.stringify(obj);
}

/**
 * 把object 合并到文件中
 * @param {*} file
 * @param {*} object
 */
function reduceJson(file, object) {
  //TODO
}


const SAVE_DATA_TASK_LIST = [
  //{
  //	fileName:"",
  //	content:null,
  //	timeAt:null
  // }
]

/**
 * 合并大json,要注意去重,去重之后还要保持有序.
 * @param oriObject
 * @param newObject
 * @return {*}
 */
export function  mergeBigObject(oriObject,newObject){
  return  deepmerge_1(oriObject, newObject,{
    arrayMerge:arrayMerge
  })
}

/**
 * 插入过程中要保持有序
 * [1,2,   ,4,5] + [1,2,3]  ==>[1,2,3,4,5]
 */
export function arrayMerge(target, source, options) {
  let dict1=arrayToDict(target,"id");
  let dict2=arrayToDict(source,"id");
  if(dict1['undefined']) return target.concat(source)
  let dict3=Object.assign(dict1,dict2)
  return dictToArray(dict3)
}


/**
 * 每5秒执行一次保存任务
 */
export function every5secondTask() {
  let OBJ = {
    //fileName:{fileName,content,timeAt}
  };
  SAVE_DATA_TASK_LIST.map((item) => {
    let ori = OBJ[item.fileName];
    if (ori == null) {
      OBJ[item.fileName] = item
    } else {
      if (item.timeAt >= ori.timeAt) {
        OBJ[item.fileName] = item
      }
    }
  });
  SAVE_DATA_TASK_LIST.length = 0;// = []
  for (let name in OBJ) {
    let startTime = new Date();
    // 这里磁盘IO瞬间上升, 不要用于生产环境!容易奔溃的.
    fs.writeFile(name, OBJ[name].content, (err) => {
      let endTime = new Date();
      let spendTime = endTime.getTime() - startTime.getTime();
      console.log("save file " + name + ",time spend:" + spendTime + "ms," + formatDateTime(endTime));
      if (err) {
        console.log(err)
      }
    })
  }
}

export function saveData(fileName, content) {
  // console.log("task:"+fileName+Date())
  SAVE_DATA_TASK_LIST.push({fileName, content, timeAt: new Date().getTime()})
}

/**
 * 日志专用
 * @param inputTime
 * @return {string}
 */
export function formatDateTime(inputTime) {
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
};

/**
 * 合并删除对象,要求按键删除
 * [{id:1},{id:2},{id:3},{id:4}] - {id:1} => [{id:2},{id:3},{id:4}]
 * @param {*} oriArray
 * @param {*} smallArray
 */
export function deleteObject(oriArray, smallArray) {
  // 假设id是唯一的
  // deleteObject([{id:1},{id:2},{id:3},{id:4}],[ {id:1}])
  let dict = arrayToDict(oriArray, "id");
  let dictSmall = arrayToDict(smallArray, "id");
  Object.keys(dictSmall).map(id => delete dict[id]);
  return Object.values(dict)
}
export function mergeObject() {
  
}
/**
 * build dict for array
 * exmple
 * [{id:1},{id:2},{id:3},{id:4}]==>{1:{id:1},2:{id:2},3:{id:3},4:{id:4}}
 * @param {array} array
 * @param {string} name
 */
export function arrayToDict(array, name) {
  let out = {};
  array.map(item => {
    out[item[name]] = item
  });
  return out
}

/**
 * {1:{id:1},2:{id:2},3:{id:3},4:{id:4}}==>[{id:1},{id:2},{id:3},{id:4}]
 * @param {*} object
 * @param {*} name
 */
export function dictToArray(object, name) {
  // arrayToDict([{id:1},{id:2},{id:3},{id:4}],"id")
  //  Object.values({1:{id:1},2:{id:2},3:{id:3},4:{id:4}})
  return Object.values(object)
}
