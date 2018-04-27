import * as http from "http";

//const http=require("http")
import {doPOST, doGET, doDelete} from "./HttpHander";
import {every5secondTask} from "./objectUtil";

const PORT = 8101;

// const http = require('http');
// const url = require('url');
// const fs = require('fs');
//
// const path = require('path');

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
setInterval(every5secondTask, 5000)
