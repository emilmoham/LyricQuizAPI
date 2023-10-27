const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

function extractTitle(fullHTML) {
    const $ = cheerio.load(fullHTML);
    return $('title').text().split('|')[0].trim();
}

function extractLyrics(fullHTML) {
    const $ = cheerio.load(fullHTML);

    let lyrics = $('div.lyrics').text()

        /* genius.org serves two DOMs for its lyrics pages, the below
           scrapes the second style (that does not contain a lyrics div) */

        if(!lyrics){
            $('[class^=Lyrics__Container]').each((i, el) => {
                const html = $(el).html()
                const lined = html.replace(/<br\s*[\/]?>/gi, "\n")
                const stripped = lined.replace(/<[^>]+>/ig, '')
                const trimmed = stripped.trim()
                const final = trimmed + '\n';
                lyrics += final
            })
        }
        if(!lyrics || fullHTML.includes('Lyrics for this song have yet to be')) {
            console.log('Failed to capture lyrics or none present')
            if(fullHTML.includes('Burrr!'))
                console.log('could not find url ', url)
            return null
        }
    return lyrics;
}

async function getSongFromWebpage(title) {
    let scrapelink;

    let proxyKey = process.env.PROXY_API_KEY;
    if (proxyKey) {
        scrapelink = `https://proxy.scrapeops.io/v1/?api_key=${proxyKey}&url=https://genius.com/${resource}`;
    } else {
        scrapelink = `https://genius.com/${resource}`;
    }

    if (process.env.DEBUG)
        console.log(scrapelink);

    gameData.link = `https://genius.com/${resource}`;
    gameData.title = 'Error Dowloading Lyrics Data';
    gameData.lyrics = '';

    await axios.get(scrapelink).then((result) => {
        try {
            const fullHTML = result.data;
            gameData.title = extractTitle(fullHTML);
            gameData.lyrics = extractLyrics(fullHTML);
            
        } catch (e) {
            console.log(e);
        }
    }, (reason) => {
        console.error(reason.message);
    });

    return gameData;
}

module.exports = {
    extractTitle,
    extractLyrics,
    getSongFromWebpage
}