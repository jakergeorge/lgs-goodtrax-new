var express = require('express');
var index = express.Router(),
    passport = require('passport'),
    mongoose = require('mongoose');

var User = mongoose.model('User');
var Album = mongoose.model('Album');

var Discogs = require('disconnect').Client;

// Authenticate by consumer key and secret
var db = new Discogs({
    consumerKey: 'oxxFkQqpQDeNLVRHqLEH',
    consumerSecret: 'YKKKGSCbEiCGlpoyOMIYItzcnCzVLqGT'
}).database();




/* GET home page. */
index.get('/', function(req, res, next) {
    if(req.user) {

        Album.count({}, function(err, count){
            var rand = Math.floor(Math.random() * count);
            var query = Album.find().skip(rand).limit(1);
            query.exec(function(err, albums){
                if(albums) {
                    albums.forEach(function (el) {
                        el.uniqueID = el.id;
                    });
                }
                if(!err){
                    res.render('index', {title: 'Welcome to GoodTracks', albums: albums});
                } else {
                    res.render('error', {message: "There was a problem retrieving random albums.", error: err});
                }
            });
        });


    } else {
        res.redirect('/login');
    }
});




index.post('/add-album', function(req, res){
    console.log(req.body.albumID);
    var albumId = mongoose.Types.ObjectId.createFromHexString(req.body.albumID);
    Album.findById(albumId, function(err, album) {
        if(req.body.playlist) {
            req.user.playlist.push({rating: 5, album: album._id});

        }
        if(req.body.wishlist) {
            req.user.wishlist.push(album._id);
        }
        if(req.body.listeningTo) {
            req.user.listeningTo.push(album._id);
        }

        req.user.save(function(err, savedUser, count) {
            console.log(savedUser);
            res.redirect('/');
        });
    });
});

index.get('/add', function(req, res) {
    if(req.user) {
        res.render('add');
    } else {
        res.redirect('/login');
    }

});

index.post('/add', function(req, res) {
        db.getRelease(req.body.discogsID, function(err, data) {
            console.log(data);
            var title = data.title;
            var tracks = [];
            data.tracklist.forEach(function(el){
               tracks.push(el.title);
            });

            var discogsID = data.id;
            var artists = [];
            data.artists.forEach(function(el) {
                artists.push(el.name);
            });
            var thumbnail = data.thumb;
            var genres = data.genres;
            var released = data.released;

            var rating = +req.body.rating;

            var album = new Album({
                title: title,
                discogsId: discogsID,
                artists: artists,
                thumbnail: thumbnail,
                songs: tracks,
                releaseDate: released,
                genres: genres
            });

            album.save(function(err, savedAlbum) {
                console.log(savedAlbum);
                if(req.body.playlist) {
                    req.user.playlist.push({rating: rating, album:savedAlbum._id});

                }
                if(req.body.wishlist) {
                    req.user.wishlist.push(savedAlbum._id);
                }
                if(req.body.listeningTo) {
                    req.user.listeningTo.push(savedAlbum._id);
                }

                req.user.save(function(err, savedUser, count) {
                    console.log(savedUser);
                    res.redirect('/');
                });
            });


        });
});

index.get('/wishlist', function(req, res) {
    if(req.user){
        var albums = [];
        if(req.user.wishlist.length > 0) {
            req.user.wishlist.forEach(function (el) {
                Album.findById(el, function (err, found) {
                    albums.push(found);

                    if (albums.length === req.user.wishlist.length) {
                        res.render('wishlist', {albums: albums});
                    }
                });
            });
        } else {
            res.render('wishlist');
        }

    } else {
        res.redirect('/login');
    }
});

index.get('/playlist', function(req, res) {
    if(req.user){
        var albums = [];
        if(req.user.playlist.length > 0) {
            req.user.playlist.forEach(function (el) {
                Album.findById(el.album, function (err, found) {
                    albums.push({rating: el.rating, album: found});

                    if (albums.length === req.user.playlist.length) {
                        res.render('playlist', {albums: albums});
                    }
                });
            });
        } else {
            res.render('playlist');
        }

    } else {
        res.redirect('/login');
    }
});

index.get('/listento', function(req, res) {
    if(req.user){
        var albums = [];
        if(req.user.listeningTo.length > 0) {
            req.user.listeningTo.forEach(function (el) {
                Album.findById(el, function (err, found) {
                    albums.push(found);

                    if (albums.length === req.user.listeningTo.length) {
                        res.render('listeningto', {albums: albums});
                    }
                });
            });
        }
        else {
            res.render('listeningto');
        }

    } else {
        res.redirect('/login');
    }
});



/* Login Logic */
index.get('/login', function(req, res) {
    res.render('login');
});

index.post('/login', function(req,res,next) {

    passport.authenticate('local', function(err,user) {
        if(user) {
            // NOTE: using this version of authenticate requires us to
            // call login manually
            req.logIn(user, function(err) {
                res.redirect('/');
            });
        } else {
            res.render('login', {message:'Your login or password is incorrect.'});
        }
    })(req, res, next);

});

/*REGISTRATION LOGIC*/

index.get('/register', function(req, res) {
    res.render('register');
});

index.post('/register', function(req, res) {
    User.register(new User({username:req.body.username, firstName:req.body.firstName, lastName: req.body.lastName}),
        req.body.password, function(err, user){
            if (err) {
                // NOTE: error? send message back to registration...
                res.render('register',{message:'Your registration information is not valid.'});
            } else {
                // NOTE: once you've registered, you should be logged in automatically
                // ...so call authenticate if there's no error
                passport.authenticate('local')(req, res, function() {
                    res.redirect('/');
                });
            }
        });
});

var sanitize = require('mongo-sanitize');


index.post("/search", function(req, res) {
    var query = req.body.searchQuery;
    query = sanitize(query.trim());

    var discogsLink='https://www.discogs.com/search/?q=';
    var queryArray = query.split(" ");
    queryArray.forEach(function(el) {
        discogsLink += el + "+"
    });

    discogsLink = discogsLink.slice(0,-1) + "&type=release";

    Album.find({ $text : { $search : query } },
        { score : { $meta: "textScore" } }
    )
        .sort({ score : { $meta : 'textScore' } })
        .exec(function(err, albums) {
            if(albums) {
                albums.forEach(function (el) {
                    el.uniqueID = el.id;
                });
            }
            if(!err) {
                res.render('search', {albums: albums, discogsSearch: discogsLink});
            } else {
                res.render('error', {message: "There was a problem searching for that album.", error: err});
            }
        });

});

module.exports = index;
