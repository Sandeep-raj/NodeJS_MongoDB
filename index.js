const mongoose = require('mongoose');

var Schema = mongoose.Schema;

function mongoConnect() {
    //connnect to a Database
    mongoose.connect('mongodb://localhost/animals', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    //Check if connection is established
    mongoose.connection.once('open', function () {
        console.log('Connection Established');
    }).on('error', function (error) {
        console.log('Connection Error: ' + error);
    })
}

function createSchhema(){
    var blogSchema = new Schema({
        title: String,
        author: String,
        body: String,
        comments: [{ body: String, date: Date }],
        date: { type: Date, default: Date.now },
        hidden: Boolean,
        meta: {
            votes: Number,
            favs: Number
        }
    });

    //Adding Instance methods to  Schema
    blogSchema.methods.findSimilarAuthorBlogs = function(cb){
        return this.model('Blog').find({author : this.author}, cb);
    }

    var animalSchema = new Schema({
        name : String,
        type : String
    });

    animalSchema.methods.findSimilarAnimals = function(cb) {
        return this.model('Animal').find({type : this.type} , cb);
    }

    //Adding Static method to Schema
    animalSchema.statics.findByName = function(animalName,cb){
        return this.find({name : animalName},cb);
    }

    //Adding Query helper function
    animalSchema.query.queryByName = function(name){
        return this.where({name : name});
    }

    return animalSchema;
}

function Save(model){
    model.save(function(err){
        if(!err){
            console.log('Data Saved Successfully');
        }
    });
}

function GetAll(model){
    model.find({}, function(err,animals){
        if(!err){
            animals.forEach(element => {
                console.log(element);
            });
        }
    });
}

function Main() {

    //Connect to a DataBase
    mongoConnect();

    //Creating Schema
    var animalSchema = createSchhema();

    //Create Model using Schema
    var animal = mongoose.model('Animal',animalSchema);

    //Adding an instance
    var dog = new animal({name:'Dojo' , type:'Dog'});
    
    //Save the instance to mongo
    //Save(dog);

    //GetAll(animal);


    //Invoking the instance method
    // dog.findSimilarAnimals(function(err,animals){
    //     if(!err){
    //         animals.forEach(element => {
    //             console.log(element);
    //         });
    //     }
    // });

    //Invoking th static method
    // animal.findByName('Dojo',function(err,animals){
    //     if(!err){
    //         animals.forEach(element => {
    //             console.log(element);
    //         });
    //     }
    // });

    //Invoking Query Helper function
    animal.find().queryByName('Dojo').exec(function(err,animals){
        if(!err){
            animals.forEach(element => {
                console.log(element);
            });
        }
    })
}

Main();