const Blog = require("./model");
const { missingParameterError, missingImageError }  = require("../utils/error");
const { LikeBlogPost } = require("@constants/routes");
const _ = require("lodash");

const  createSession = (req,res, next) => {
    
};


const deleteSession = (req, res, next ) => {
   
};



module.exports = {
  createSession,
  deleteSession
};