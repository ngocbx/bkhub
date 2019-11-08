const moment = require('moment');

const getTodayDate = () => {
    return moment().format("YYYY-MM-DD");
}

const isValidDate = (date) => {
    return moment(date).isValid();
}

const getFormatDate = (date) => {
    return moment(date).format('YYYY-MM-DD');
}

const getResponseDate = (date) => {
    return moment(date).format('DD-MM-YYYY');
}

module.exports = {
    getTodayDate,
    isValidDate,
    getFormatDate,
    getResponseDate
}
