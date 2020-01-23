//const mongoose = require('mongoose');
const util = require('./StudentModel.ts');
var fs = require('fs');

const bestPeople = ['Sid', 'Abhishek'];

function connect() {
    util.mongoose.connect("mongodb://localhost/students", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    util.mongoose.connection.once('open', function () {
        console.log('Connection Established');
    }).on('error', function (error) {
        console.log('Connection failed ' + error);
    });
}

function getMockData() {
    var data = fs.readFileSync('./StudentMock.json', 'utf-8')
    data = JSON.parse(data);
    return data;
}

function saveDocument(instance) {
    instance.save(function (err) {
        if (!err) {
            console.log('data saved sucessfully');
        }
        else {
            console.log(err);
        }
    });
}

function bulkSaveDocument(model, instanceArray) {
    model.insertMany(instanceArray, function (err, result) {
        if (!err) {
            console.log('Data Saved Successfully');
        } else {
            console.log(err);
        }
    })
}

function createCollection() {
    var students = [];
    getMockData().forEach(element => {
        var student = new util.studentModel({
            name: element.name.firstName + " " + element.name.lastName,
            age: element.age,
            marks: {
                Physics: element.marks.Physics,
                Chemistry: element.marks.Chemistry,
                Maths: element.marks.Maths
            },
            gender: element.gender
        });
        students.push(student);
        saveDocument(student);
    });
    bulkSaveDocument(util.studentModel, students);
}

function updateWithUpsert(model,filter,updateInstance){
    model.updateMany(filter , updateInstance , { upsert : true}).exec(function(err,data){
        if(!err){
            console.log(data);
        }
        else
            console.log(err);
    });
}

function updateWithQuery(model,filter,query,options){
    model.updateMany(filter,query,options,(err,doc) => {
        if(err){
            console.log(err);
        }
        else{
            console.log(doc);
        }
    }).exec(function(err,data){
        if(!err)
        console.log(data);
        else
        console.log(err);
    });
}

function deleteMany(model,filter){
    model.deleteMany(filter).exec(function(err,data){
        if(!err)
            console.log(data);
        else
            console.log(err);
    })
}

function fetch(model, filter, cb) {
    return model.find(filter, cb);
}

function Main() {
    connect();
    createCollection();

    //fetch all records
    fetch(util.studentModel,{},function(err,data){
        if(!err){
            data.forEach(ele => {
                console.log(ele);
            })
        }
    });
    //fetch with condition
    fetch(util.studentModel,{gender : 'female',_id : '5db252855492ff2f8c8196ec'},function(err,data){
        if(!err){
            data.forEach(ele => {
                console.log(ele);
            })
        }
    });

    //Queries
    //fetch  all those students whose avg marks is greater than total average marks
    util.studentModel.aggregate([
        {
            $addFields: {
                avg_marks: { $avg: ['$marks.Physics', '$marks.Chemistry', '$marks.Maths'] }
            }
        },
        {
            $group: {
                _id: null,
                average: { $avg: '$avg_marks' }
            }

        }
    ]).exec(function (err, data) {
        if (!err) {
            util.studentModel.aggregate([
                {
                    $addFields: {
                        avg_marks: { $avg: ['$marks.Physics', '$marks.Chemistry', '$marks.Maths'] }
                    }
                },
                {
                    $match: {
                        avg_marks: { $gte: data[0].average }
                    }
                }
            ]).exec(function (err, data) {
                if (!err) {
                    console.log(data);
                }
                else {
                    console.log(err);
                }
            });
        }
        else
            console.log(err);
    })

    //find all the best people who got more than 25 in maths.
     bestPeople.forEach(ele => {
         util.studentModel.find({ name: {$regex : '.*'+ele+'.*'} }).where('marks.Maths').gte(25).exec(function (err, data) {
            if (!err){
                console.log(data[0]);
            }
            else {
                console.log(err);
            }
        });
    });


    //update
    updateWithUpsert(util.studentModel,{name : 'Vineet Singh'},{
        name : 'Vineet Singh',
        age : 25,
        marks : {
            Physics : 25, 
            Chemistry : 29,
            Maths : 35
        },
        gender : 'male'
    });

    //delete
    deleteMany(util.studentModel,{name : 'Vineet Singh'});

    //update with query
    //update the grade of a student 'Vineet Singh'
    updateWithQuery(util.studentModel,{gender : 'feMale'},
        {$set : {gender : 'female'}}
    ,{
        multi : true,
        upsert : true,
        new : true
    });
    
}

Main();