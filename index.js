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
        console.log(sql)
        con.query(sql, function(error, result) {
            if (error) throw error;
            resolve(result)
        });
    });
}

const removeInfo = (str) => {
    return new Promise(resolve => {
        let view_count = str.replace('visualizações', '');
        resolve(view_count.replace('.', ''))
    });
}

const getCount = async(url) => {
    await got(url.link).then(response => {
            let $ = cheerio.load(response.body);
            if (typeof $('div[class=watch-view-count]')[0] === 'undefined') {
                getCount(url);
            } else {
                removeInfo($('div[class=watch-view-count]')[0].children[0].data).then(result => {
                    updateObjetoApr(con, url.id, result)
                })
            }
        })
        .catch(error => {
            console.log(error);
        });
}

getObjetoApr(con)
    .then(response => {
        for (var item in response) {
            getCount(response[item])
        }
    })
    .catch(e => console.log(e))