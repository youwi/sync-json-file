** 简单的多端同步工具,用于局域网

** 原理,POST接收一个json,接口负责合并所有json,每次GET,返回全部JSON,json保存为文件.

** 为何不用moongo等数据库呢

** 为了方便js代码直接调用

运行

    node syncSever.js
默认端口 8101
    
使用方法

        GET /abc  => {}
        POST /abc {a:1} =>{a:1}
        POST /abc {b:1} =>{a:1,b:1}
        POST /abc {c:1} =>{a:1,b:1,c:1}
        POST /abc {c:1} =>{a:1,b:1,c:1}
        
以路径为一个存储结构!

- 啥,啥叫效率?根本没有这回事.
- 啥,啥叫异步?根本没有这回事.