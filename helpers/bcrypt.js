const bcrypt = require('bcrypt');
const colors = require('colors');

// By using BCRYPT securing our password before storing it into DATABASE
module.exports.createHashPassword = async (password) => {
    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds); // this generates hash-password 
        return hashedPassword;
    } catch (error) {
        console.log(`Error in bcrypting the password :: ${error}`.bgRed.white);
    }
};

// for matching password means:----- [entered-password == hash-password ]
module.exports.comparePassword = async (password, hashedPassword) => {
    try {
        return bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.log(`Error in comparing the password :: ${ error}`.bgRed.white);
    }
};