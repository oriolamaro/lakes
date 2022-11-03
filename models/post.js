const mongoose = require('mongoose');
const User = require('./user');
const PostSchema  = new mongoose.Schema({
    title :{
        type  : String,
        required : true
    },
    author :{
        type  : String,
        required : true
    },
    content :{
        type  : String,
        required : true
    },
    date :{
        type : String,
        default : new Date().toISOString().slice(0, 19).replace('T', ' ')
    },
    description :{
        type: String,
        required : true
    },
    image :{
        type : String,
        required : true
    },
    likes :{
        type : Number,
        default : 0
    }
});
const Post = mongoose.model('Post', PostSchema);

module.exports = Post;