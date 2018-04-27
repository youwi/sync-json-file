import {arrayMerge} from "../src/ObjectUtil";
//import("../src/ObjectUtil.mjs")
console.log(arrayMerge([1, 2, 4, 5], [1, 2, 3]))
// node --experimental-modules *.mjs

let a = [
  {
    "id": "0fee915c-6d1d-4f2c-a25d-d0b67c3d3b06",
    "comment": "",
    "command": "type",
    "target": "id=kw",
    "value": "fafaw"
  },
  {
    "id": "aa0ed112-5687-46b9-bf40-5f05cbf38c3e",
    "comment": "",
    "command": "sendKeys",
    "target": "id=kw",
    "value": "${KEY_ENTER}"
  }
]
let b = [
  {
    "id": "0fee915c-6d1d-4f2c-a25d-d0b67c3d3b06",
    "comment": "",
    "command": "type",
    "target": "id=kw",
    "value": "fafaw"
  },
  {
    "id": "4cb4adb0-9817-41e5-b669-262dfb31301e",
    "comment": "",
    "command": "open",
    "target": "/wiki/River_Chater",
    "value": ""
  }]

console.log(arrayMerge(a,b))
