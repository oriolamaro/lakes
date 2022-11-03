const express = require('express');
const router  = express.Router();
const {ensureAuthenticated} = require('../config/auth') 
const Post = require("../models/post");
const User = require('../models/user');

//home page
router.get('/', (req, res) => {
    res.redirect('/home');
})

router.get('/home', (req,res)=>{

    Post.find({}, function(err, posts) {

        posts.forEach(function(post) {
            
            // POST CONTENT
            router.get('/' + post._id, (req, res)=>{
                res.render('post', {
                    title : post.title,
                    content : post.content,
                    author : post.author,
                    date : post.date,
                    image : post.image
                });
            });

            // POST LIKE
            router.post('/' + post._id + '/like', (req, res, next) => {

                if (req.user.liked.includes(post._id)){

                    Post.updateOne({_id : post._id}, {$inc: {likes: -1}}, {}, (err, res) => {});
                    
                    const liked = req.user.liked;
                    const index = liked.indexOf(post._id);
                    if (index > -1) {
                        liked.splice(index, 1); 
                    }

                    User.updateOne({_id : req.user._id}, {$set: {liked : liked}}, {}, (err, res) => {});

                } else {

                    Post.updateOne({_id : post._id}, {$inc: {likes: 1}}, {}, (err, res) => {});
                    User.updateOne({_id : req.user._id}, {$push: {liked : String(post._id)}}, {}, (err, res) => {});

                }

            });
    
        });
    
    });

    Post.find({}, function(err, posts) {

        var postsMap = {};
        var postsContent = [];

        posts.forEach(function(post) {
            postsMap[post._id] = post;
            postsContent.push(post);
        });

        if (req.user !== undefined) {

            res.render('userHome', {
                user : req.user,
                posts : postsContent
            });
    
        } else {

            res.render('noUserHome', {
                posts : postsContent
            });
    
        }

    });
})

Post.find({}, function(err, posts) {

    posts.forEach(function(post) {

        router.get('/' + post._id, (req, res)=>{
            res.render('post', {
                title : post.title,
                content : post.content,
                author : post.author,
                date : post.date,
                image : post.image
            });
        })

    });

});

//register page
router.get('/register', (req,res)=>{
    res.render('register');
})

router.get('/dashboard', ensureAuthenticated, (req,res)=>{

    const titles = [];
    const liked = req.user.liked;

    Post.find({ _id : { $in: liked }}, function(err, posts) {

        for (var i = 0; i < posts.length; i++) {
            titles.push(posts[i].title);
        }

        if (req.user.admin === true) {

            res.render('admin', {
                user: req.user,
                liked: liked, 
                titles: titles
            });

        } else {

            res.render('dashboard', {
                user: req.user, 
                liked: liked, 
                titles: titles
            });

        }

    })

})



router.post('/posts/upload', ensureAuthenticated, (req, res)=>{
    const {title, description, content, image} = req.body;

    let errors = [];
    if(!title || !description || !content || !image) {
        errors.push({msg : "Please fill in all fields"})
    }

    if(errors.length > 0 ) {
        res.render('admin', {
            user : req.user,
            errors : errors,
            title : title,
            description : description,
            content : content,
            image : image
        })
    } else {
        const newPost = new Post({
            title : title,
            description : description,
            content : content,
            author : req.user.name,
            image : image
        });
        newPost.save()

        req.flash('success_msg','The post has been uploaded successfully!');
        res.redirect('/dashboard');
    }
})

module.exports = router; 