const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        uniqure: true,
    },
    password: {
        type: String,
        required: true,
    },
});

mongoose.model.exports = mongoose.model('User', userSchema);