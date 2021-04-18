const fs = require("fs");
const path = require("path");
const fastCsv = require("fast-csv");
const response = require("./response");

const filesDirectory = "/Users/rochakgupta/Documents/GitHub/usc-csci-572/hw4/data/latimes/latimes";

const filenameToUrlFilepath = path.join(__dirname, "data", "URLtoHTML_latimes_news.csv");

const getFilepath = (filename) => `${filesDirectory}/${filename}`;

const buildFilepathToUrlData = async () => {
    const data = {};
    return new Promise((resolve, reject) => {
        fs.createReadStream(filenameToUrlFilepath)
            .pipe(fastCsv.parse())
            .on("error", (error) => {
                reject(error);
            })
            .on("data", (row) => {
                const [filename, url] = row;
                const filepath = getFilepath(filename);
                data[filepath] = url;
            })
            .on("end", () => {
                resolve(data);
            });
    });
};

let filepathToUrlData = null;

const getUrlByFilepath = async (filepath) => {
    if (!filepathToUrlData) {
        try {
            filepathToUrlData = await buildFilepathToUrlData();
        } catch (error) {
            console.log(error);
            throw new response.InternalServerError("Server errored while reading file to url csv");
        }
    }
    return filepathToUrlData[filepath];
};

module.exports = {
    getUrlByFilepath
};
