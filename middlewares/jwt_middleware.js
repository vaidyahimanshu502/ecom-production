const jwt = require("jsonwebtoken");

module.exports.checkAuthentication = async (req, res, next) => {
  try {
    const decodedToken = await jwt.verify(
      req.headers.authorization,            // to use this pass token in the headers like see bellow-
      process.env.JWT_SECRET                // Authorization : token [in header not in authorization]
    );
    // console.log("TOKENNNN", req.headers.authorization);
    if (!decodedToken) {
      return res.status(404).json({
        success: false,
        message: "Token expired! please re generate it!!",
      });
    }
    req.user = decodedToken;    // to setting up user as decoded. or sending it with next() Method!
    // console.log(req.user._id)
    // console.log(decodedToken)
    next();
  } catch (error) {
    let errMsg = error.message;
    if (process.env.environment === "production") {
      errMsg = "Internal Server Error!";
    }
    return res.status(500).json({
      success: false,
      message: errMsg,
    });
  }
};
