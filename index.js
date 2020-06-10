const cheerio = require('cheerio');
const got = require('got');
const mysql = require('mysql');
require('dotenv').config();

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

const sleep = (milliseconds) => {
    return new Promise((resolve) => {
        setTimeout(resolve('3 segundos de paua'), milliseconds)
    })
}

const getObjetoApr = (con) => {
    return new Promise(resolve => {
        con.query('SELECT * FROM  objeto_aprendizagem WHERE data like "%2019-12-18%" ', function(error, results) {
            if (error) throw error;
            let urls = [];
            results.forEach(element => {
                urls.push({
                    'id': element.id,
                    'link': element.url_youtube,
                });
            });
            resolve(urls)
        });
    });
}

function formatDate() {
    let d = new Date(),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear(),
        hour = d.getHours(),
        minute = d.getMinutes(),
        second = d.getSeconds();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;
    let time = [hour, minute, second].join(':')
    let date = [year, month, day].join('-');
    return [date, time].join(' ');
}

const updateObjetoApr = (con, id, total) => {
    return new Promise(resolve => {
        let sql = 'UPDATE objeto_aprendizagem SET num_acesso = ' + total + ', updated_at="' + formatDate() + '" WHERE id = ' + id;
        con.query(sql, function(error, result) {
            if (error) throw error;
            resolve(result.message)
        });
    });
}

const removeInfo = async(str) => {
    let view_count = str.replace('visualizações', '');
    view_count.replace('.', '')
    return view_count
}

const getCount = async(url) => {
    let temp = []
    await got(url.link).then(response => {
            let $ = cheerio.load(response.body);
            if (typeof $('div[class=watch-view-count]')[0] === 'undefined' || $('div[class=watch-view-count]')[0].children[0] === 'undefined') {
                getCount(url);
            } else {
                temp = removeInfo($('div[class=watch-view-count]')[0].children[0].data)
                    // console.log(temp)
            }
        })
        .catch(error => {
            console.log(error);
        });
    if (temp.length != 0)
        return temp
    else
        return getCount(url)
}

getObjetoApr(con)
    .then(async response => {
        for (var item in response) {
            await getCount(response[item])
                .then(result => {
                    updateObjetoApr(con, response[item].id, result)
                        .then(resp => {
                            console.log(resp)
                        })
                    console.log(result)
                })
        }
    })
    .then(() => {
        con.end()
    })
    .catch((e) => console.log(e))