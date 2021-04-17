const fs = require('fs');
const fastCsv = require('fast-csv');

const dataDirectory = '/Users/rochakgupta/Documents/GitHub/usc-csci-572/hw4/data';

const filesDirectory = `${dataDirectory}/latimes/latimes`

const filenameToUrlFilepath = `${dataDirectory}/URLtoHTML_latimes_news.csv`;

const getFilepath = (filename) => `${filesDirectory}/${filename}`;

const buildFilepathToUrlData = async () => {
    const data = {};

    return new Promise(function (resolve, reject) {
        fs.createReadStream(filenameToUrlFilepath)
            .pipe(fastCsv.parse())
            .on('error', error => reject(error))
            .on('data', row => {
                const [filename, url] = row;
                const filepath = getFilepath(filename);
                data[filepath] = url;
            })
            .on('end', () => {
                resolve(data);
            });
    });
}

let filepathToUrlData = null;

const getUrlByFilepath = async (filepath) => {
    if (!filepathToUrlData) {
        filepathToUrlData = await buildFilepathToUrlData();
    }
    return filepathToUrlData[filepath];
}

module.exports = {
    getUrlByFilepath
}

