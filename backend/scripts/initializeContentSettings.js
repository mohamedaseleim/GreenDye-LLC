/* eslint-disable no-console */
require('dotenv').config();
const mongoose=require('mongoose');
const ContentSettings=require('../models/ContentSettings');
(async()=>{try{await mongoose.connect(process.env.MONGODB_URI);const existing=await ContentSettings.findOne();if(existing){console.log('Content settings already exist; no overwrite performed.')}else{await ContentSettings.create({});console.log('Current GreenDye content settings initialized.')}}catch(error){console.error(error);process.exitCode=1}finally{await mongoose.disconnect()}})();
