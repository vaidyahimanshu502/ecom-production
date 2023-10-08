const userModel = require('../models/userModel');
const jwt = require('../middlewares/jwt_middleware');

module.exports.isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user.id);  // here do not pass _id just pass id bcz we have 
        console.log('USER', user)                            // decoded the json into string so no need to 
        if(user.role !== 1) {                                // write _id here
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access!'
            })                                               //to check it make the role: 1 in db
        } else {
            next();
        }
    } catch (error) {
        let errMsg = error.message;
        if (process.env.environment === "production") {
        errMsg = "Internal Server Error!";
        }
        return res.status(500).json({
        success: false,
        message: errMsg,
        msg: 'Error in Admin middleware!'
        });
    }
}