const express = require('express')
const router = express.Router()
// 导入用户路由处理函数模块
const userHandler = require('../router_handler/userinfo')


router.get('/userinfo', userHandler.getUserInfo)

module.exports = router