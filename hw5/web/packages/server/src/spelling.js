const path = require("path");
const SpellingCorrector = require("spelling-corrector");

const bigFilepath = path.join(__dirname, "data", "big.txt");

let instance = null;

const getInstance = () => {
    if (!instance) {
        instance = new SpellingCorrector();
        instance.loadDictionary(bigFilepath);
    }
    return instance;
};

const correct = (text) => {
    const instance = getInstance();
    const corrected = text
        .split(" ")
        .map((word) => instance.correct(word))
        .join(" ");
    return corrected;
};

module.exports = {
    correct
};
