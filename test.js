const fetch = require("iso-whatwg-fetch")
const fs = require('fs');
const assert = require('assert');
try{
  fs.unlinkSync("./data/abc.json")
}catch (e) {

}

fetch("http://127.0.0.1:8101/abc")
  .then(response => response.text())
  .then((text) => {
    console.log(text)
  })


fetch("http://127.0.0.1:8101/abc", {
  method: "POST",
  headers: {
    'Content-Type': 'application/json'
  },
  body: '{"a":1}'
}).then(response => response.text())
  .then((text) => {
    console.log(text)
    assert.equal(text,"{\"a\":1}")
  })


fetch("http://127.0.0.1:8101/abc", {
  method: "POST",
  headers: {
    'Content-Type': 'application/json'
  },
  body: '{"b":1}'
}).then(response => response.text())
  .then((text) => {
    console.log(text)
    assert.equal(text,"{\"a\":1,\"b\":1}")

  })


fetch("http://127.0.0.1:8101/abc", {
  method: "POST",
  headers: {
    'Content-Type': 'application/json'
  },
  body: '{"b":2}'
}).then(response => response.text())
  .then((text) => {
    console.log(text)
    assert.equal(text,"{\"a\":1,\"b\":2}")
  })
