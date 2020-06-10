const cheerio = require('cheerio');
const got = require('got');

let urls = [
    'https://www.youtube.com/watch?v=f2rPHMSOYxc',
    'https://www.youtube.com/watch?v=gdY9n0A1F-k',
    'https://www.youtube.com/watch?v=GcT74izO5N8',
    'https://www.youtube.com/watch?v=ZYWuFzs4BPA'
]

const removeInfo = (str) => {
    let view_count = str.replace('visualizações', '');
    return view_count.replace('.', '');
}

const getCount = (url) => {
    got(url).then(response => {
            let $ = cheerio.load(response.body);
            if (typeof $('div[class=watch-view-count]')[0] === 'undefined')
                getCount(url)
            else {
                let tag = removeInfo($('div[class=watch-view-count]')[0].children[0].data)
                console.log(tag)
            }

        })
        .catch(error => {
            console.log(error);
        });
}

urls.forEach(element => {
    getCount(element)
})