// 原生http模块,用于请求文件或者创建服务器
var http = require('http');
// 原生fs模块,用于读写文件
var fs = require('fs');
// 调用第三方cheerio和mysql模块
var cheerio = require('cheerio');
var mysql = require('mysql');
// 连接数据库
var connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'second'
    })
    // 执行链接
connection.connect();
// 用于获取需要被爬虫的网页DOM结构
function download(url, callback) {
    http.get(url, function(res) {
        var data = '';
        res.on('data', function(chunk) {
            data += chunk
        })
        res.on('end', function() {
            callback(data);
        })
    })
}

download('在此处输入需要抓包的网站链接', function(data) {
    // cheerio处理网页信息
    var $ = cheerio.load(data);
    var imgarr = [];
    // 选择图片元素并将图片地址保存到本地数据库
    $('img').each(function(index, item) {
            console.log(item)
            var src = $(item).attr('src');
            connection.query('INSERT INTO `img`(`img`) VALUES ("' + src + '")', function(error, results, fields) {
                if (error) throw error;
            });
            imgarr.push(src);
            console.log(imgarr)
        })
        // 执行图片下载
    downloadImg(imgarr);
})

var i = 0;

function downloadImg(imgarr) {
    var len = imgarr.length;
    var writerStream = fs.createWriteStream('img/' + i + '.jpg');
    http.get(imgarr[i], function(res) {
        res.pipe(writerStream);
        if (i < len) {
            i++;
            // 遍历执行图片下载,每下载完一张图片再下载下一张
            downloadImg(imgarr);
        } else {
            return;
        }
    })
}


// 在nodejs中执行 node img.js即可运行程序
