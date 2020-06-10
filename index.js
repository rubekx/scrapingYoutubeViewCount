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

const updateObjetoApr = (con, id, total) => {
    return new Promise(resolve => {
        let sql = 'UPDATE objeto_aprendizagem SET num_acesso = ' + total + ' WHERE id = ' + id;
        con.query(sql, function(error, result) {
            if (error) throw error;
            resolve(result)
        });
    });
}

const removeInfo = (str) => {
    // return new Promise(resolve => {
    let view_count = str.replace('visualizações', '');
    // resolve(view_count.replace('.', ''))
    // });
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
                    console.log(result)
                })
        }
    })
    .then(_ => con.end())
    .catch(e => console.log(e))