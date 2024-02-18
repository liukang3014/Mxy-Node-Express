// 导入 mysql 模块
const mysql = require('mysql')
// 创建数据库连接对象
const db = mysql.createPool({
host: '110.41.153.42',
user: 'ceshi1',
password: 'ceshi1',
database: 'ceshi1',
})
// 向外共享 db 数据库连接对象
module.exports = db