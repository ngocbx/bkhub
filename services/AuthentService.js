const axios = require("axios");
module.exports.getGoogleUser = async (accessToken) => {
    
    let getProfileUrl = `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`;
    
    return new Promise((resolve, reject) => {
        axios(getProfileUrl).then((response) => {
            return resolve(response.data);
        }).catch((err) => {
            return reject(err);
        });
    });
};

module.exports.getFacebookPhone = async (accessToken) => {
    
    let getFacebookUrl = `https://graph.accountkit.com/v1.1/me?access_token=${accessToken}`;
    
    return new Promise((resolve, reject) => {
        axios(getFacebookUrl).then((response) => {
            return resolve(response.data);
        }).catch((err) => {
            return reject(err);
        });
    });
};