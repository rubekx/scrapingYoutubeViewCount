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
        con.query('SELECT * FROM  objeto_aprendizagem WHERE data like "%2018-11%" ', function(error, results) {
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
            resolve(result.affectedRows)
        });
    });
}

const removeInfo = (str) => {
    let view_count = str.replace('visualizações', '');
    return view_count.replace('.', '');
}

const getCount = (url) => {
    got(url.link).then(response => {
            let $ = cheerio.load(response.body);
            if (typeof $('div[class=watch-view-count]')[0] === 'undefined')
                getCount(url)
            else {
                // let total = removeInfo($('div[class=watch-view-count]')[0].children[0].data)
                // console.log(total)
                // return total
                return removeInfo($('div[class=watch-view-count]')[0].children[0].data)

            }

        })
        .catch(error => {
            console.log(error);
        });
}

getObjetoApr(con)
    .then(response => {
        let count = [];
        for (var item in response) {
            count.push({
                'id': response[item].id,
                'total': getCount(response[item]),
            });
        }
    })
    .then(response => {
        for (var item in response) {
            console.log(response[item])
            updateObjetoApr(con, response[item].id, response[item].total)
        }
        con.end();
    })
    .catch(e => console.log(e))