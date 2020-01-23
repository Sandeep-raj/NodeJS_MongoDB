const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var studentSchema = new Schema({
    name : String,
    age : Number,
    marks : {
        Physics : Number,
        Chemistry : Number,
        Maths :Number
    },
    gender : {
        type : String,
        default : 'male'
    }
});

// mongoose.connect("mongodb://localhost/students",{
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     });
//     mongoose.connection.once('open', function(){
//         console.log('Connection Established');
//     }).on('error',function(error){
//         console.log('Connection failed '+error);
// });

module.exports.studentModel = mongoose.model('student',studentSchema);;
module.exports.mongoose = mongoose;



