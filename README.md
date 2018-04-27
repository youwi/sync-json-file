## 简单的多端同步工具,用于局域网

## 原理
   POST接收一个json,接口负责合并所有json,每次GET,返回全部JSON,json保存为文件.

### 为何不用moongo等数据库呢
- POST/GET方便调用
- 减少占用资源
- 超级轻量级,一个脚本可用.
- 内存缓存

#### 

### 原则
    一个脚本解决问题,不依赖除任何服务

### 说明

运行

    rollup -c 
    node SyncSever.js
    # node dist/SyncSever.es6.js   (es6)
    # node src/SyncServer.mjs   (未来nodejs能直接支持时可以直接运行)

### rollup 说明
目前由于代码调整.src统一使用mjs. 暂没有配置webpack

    ./src/*.mjs  #源代码,未来能直接运行
    ./dist/SyncServer.dist.js  # Web包装的代码
    ./SyncServer.js  #nodejs 可以运行的代码.

    
默认端口 8101
    
使用说明

        GET /abc  => {}  or 404
        POST /abc {a:1} ==>{a:1}
        POST /abc {b:1} ==>{a:1,b:1}
        POST /abc {c:1} ==>{a:1,b:1,c:1}
        POST /abc {c:1} ==>{a:1,b:1,c:1}
        DELETE /abc {c:1} ==>{a:1,b:1}
        POST /abc {f:[1,2,3]} ==> {a:1,b:1,f:[1,2,3} }
        POST /abc {f:[1,2,4]} ==> {a:1,b:1,f:[1,2,4} }//数组还不支持合并.

        
以路径为一个存储结构!

- 啥,啥叫效率?根本没有这回事.
- 啥,啥叫异步?根本没有这回事.
- 啥,啥叫实时同步?根本没有这回事.

## 性能
   目前局域网性能还过得去.做为协同步工具可以使用了.不要用云环境部署.
   
   500 tps/per/api
   多接口很压榨磁盘性能.
   
## 缺点
   脚本还是太长.本只有50来行的,后来为了性能优化搞到300行了.
   
## 参考 
    深度复制 
    https://github.com/jonschlinkert/merge-deep
    https://github.com/KyleAMathews/deepmerge