var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');


var User = new mongoose.Schema({
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    playlist: [{
                rating: Number,
                album:{ type: mongoose.Schema.Types.ObjectId, ref: 'Album'}
    }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album'}],
    listeningTo: [{type: mongoose.Schema.Types.ObjectId, ref: 'Album'}]
    /*
    
       Playlist, wishlist, listening to
     */
});


var Album = new mongoose.Schema({
    title: {type: String, required: true},
    discogsId: {type: Number, required: true},
    artists: [String],
    thumbnail: String,
    songs: [String],
    releaseDate: String,
    genres: [String]
}, {
    _id: true
});

User.plugin(passportLocalMongoose);

mongoose.model('User', User);
mongoose.model('Album', Album);

/* Ensure index for search functionality*/

/*Change to correct db config*/
mongoose.connect("mongodb://localhost:27017/largescalez", {mongos: true});
