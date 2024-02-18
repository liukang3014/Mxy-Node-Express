/**
* 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
*/
// 导入数据库操作模块
const db = require('../db/index')
// 导入 bcryptjs
const bcrypt = require('bcryptjs')
// 导入 jsonwebtoken 包
const jwt = require('jsonwebtoken')
// 导入全局配置文件(密钥)
const config = require('../config')


// 注册用户的处理函数
exports.regUser = (req, res) => {
    // 接收表单数据
    const userinfo = req.body
    const sql = `select * from user_basic where username=?`
    db.query(sql, userinfo.username, function (err, results) {
        if (err) {
            return res.cc(err)
        }
        // 用户名被占用
        if (results.length > 0) {
            return res.cc('用户名被占用，请更换其他用户名！')
        }
        userinfo.password = bcrypt.hashSync(userinfo.password, 10)
        // 插入用户的 SQL 语句
        const sql = 'insert into user_basic set ?'
        db.query(sql, userinfo,
            function (err, results) {
                if (err) return res.cc(err)
                if (results.affectedRows !== 1) {
                    return res.cc('注册用户失败，请稍后再试！')
                }
                res.cc('注册成功！', 0)
            })

    })
}


// 封装数据库查询函数
function queryDatabase(sql, params, callback) {
    db.query(sql, params, function (err, results) {
        if (err) {
            return callback(err, null);
        }
        callback(null, results);
    });
}

// 封装注册用户函数
exports.enrolment = (req, res) => {
    // 接收表单数据
    const userinfo = req.body;

    // 查询用户报名进度
    const queryStatusSql = `SELECT * FROM interview_status WHERE phone_number=?`;
    queryDatabase(queryStatusSql, userinfo.phone_number, (err, results) => {
        if (err) {
            return res.cc(err);
        }
        // 如果用户报名进度已存在，则返回错误消息
        if (results.length > 0) {
            return res.cc('用户已报名');
        }

        // 查询用户名是否被占用
        const queryUsernameSql = `SELECT * FROM user_basic WHERE phone_number=?`;
        queryDatabase(queryUsernameSql, userinfo.phone_number, (err, results) => {
            if (err) {
                return res.cc(err);
            }
            // 如果用户名被占用，则返回错误消息
            if (results.length > 0) {
                return res.cc('用户名以注册！');
            }
            const sql = 'insert into interview_status set ?'
            db.query(sql, { phone_number: userinfo.phone_number, user_clusters: userinfo.user_clusters },
                function (err, results) {
                    if (err) return res.cc(err)
                    if (results.affectedRows !== 1) {
                        return res.cc('注册用户失败，请稍后再试！')
                    }
                })

            // 对密码进行加密处理
            userinfo.password = bcrypt.hashSync(userinfo.password, 10);
            // 插入用户信息到数据库
            const insertSql = 'INSERT INTO user_basic SET ?';
            delete userinfo.user_clusters
            queryDatabase(insertSql, userinfo, (err, results) => {
                if (err) {
                    return res.cc(err);
                }
                // 如果插入成功，则返回成功消息
                if (results.affectedRows === 1) {
                    return res.cc('注册成功！', 0);
                }
                // 否则返回错误消息
                return res.cc('注册用户失败，请稍后再试！');
            });
        });
    });
};

// 登录的处理函数
exports.login = (req, res) => {
    // 接收表单数据
    const userinfo = req.body
    console.log(req.body);
    // 定义 SQL 语句 
    const sql = `select * from user_basic where username=?`
    // 执行 SQL 语句，查询用户的数据
    db.query(sql, userinfo.username, function (err, results) {
        // 执行 SQL 语句失败
        if (err) return res.cc(err)
        // 执行 SQL 语句成功，但是查询到数据条数不等于 1
        if (results.length !== 1) return res.cc('登录失败！')
        // 判断用户输入的登录密码是否和数据库中的密码一致(调用 bcrypt.compareSync(用户提交的密码, 数据库中的密码) 方法比较密码是否一致)
        // 拿着用户输入的密码,和数据库中存储的密码进行对比
        // console.log(results);
        const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
        // 如果对比的结果等于 false, 则证明用户输入的密码错误
        if (!compareResult) {
            return res.cc('登录失败！')
        }
        // 登陆成功，生成jwt的token 字符串
        //通过 ES6 的高级语法，快速剔除 密码 和 头像 的值
        const user = { ...results[0], password: '' }
        // console.log(user);
        // 对用户信息进行加密，生成token字符串
        const tokenstr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
        // console.log(tokenstr);
        // 登陆成功响应客户端
        res.send({
            status: 0,
            message: '登录成功！',
            token: 'Bearer ' + tokenstr,
        })
    })

}