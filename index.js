const cheerio = require('cheerio');
const got = require('got');

let urls = ['https://youtu.be/lS70zNY6wNQ', 'https://youtu.be/gHZRJvv9YTM']

const getCount = async(url) => {
    await got(url).then(response => {
        let $ = cheerio.load(response.body);
        console.log($('.view-count')[0].children[0].data)
    }).catch(err => {
        console.log(err);
    });
}

urls.forEach(element => {
    getCount(element);
})