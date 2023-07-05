const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    pfp: {type: String, required: false},
    username: {type: String, required: true, unique: true}, // allows only unique usernames
    description: {type: String, required: true},
})

const ProfileModel = mongoose.model('profiles', profileSchema)

module.exports = ProfileModel;