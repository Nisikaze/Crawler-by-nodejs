var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'second'
})

connection.connect();

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

download('http://www.nipic.com/index.html', function(data) {
    var $ = cheerio.load(data);
    var imgarr = [];
    $('img').each(function(index, item) {
        console.log(item)
        var src = $(item).attr('src');
        connection.query('INSERT INTO `img`(`img`) VALUES ("' + src + '")', function(error, results, fields) {
            if (error) throw error;
        });
        imgarr.push(src);
        console.log(imgarr)
    })

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
            downloadImg(imgarr);
        } else {
            return;
        }
    })
}
