const cheerio = require('cheerio');
const got = require('got');

let video_count = []
let urls = [
    'https://www.youtube.com/watch?v=f2rPHMSOYxc',
    'https://www.youtube.com/watch?v=gdY9n0A1F-k',
    'https://www.youtube.com/watch?v=GcT74izO5N8',
    'https://www.youtube.com/watch?v=ZYWuFzs4BPA'
]

const getCount = (url) => {
    got(url).then(response => {
            let $ = cheerio.load(response.body);
            if (typeof $('div[class=watch-view-count]')[0] === 'undefined')
                getCount(url)
            else {
                let tag = $('div[class=watch-view-count]')[0].children[0].data
                let total = tag.replace('visualizações', ' ');
                total = total.replace('.', '');
                console.log(url + ': ' + total)
            }

        })
        .catch(err => {
            console.log(err);
        });
}


// while (urls.length > 0) {

// }
urls.forEach(element => {
    getCount(element)
})