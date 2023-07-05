// dependencies
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path')
// helps manage files uploaded from frontend
const multer = require('multer')

// determines where we store images, name of files, and other specifications of file
const storage = multer.diskStorage({
    // cb (callback function) determines where we store images
    destination: (req, file, cb) => {
        // first argument handles errors, second argument is destination
        cb(null, 'images')
    },
    // filename makes sure to differentiate duplicate files by adding the date of file's upload
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

// filters through the file types
const fileFilter = (req, file, cb) => {
    const allowedFileTypes = ['image/jpeg', 'image/jpg', 'image/png']

    // if our allowedFileTypes match with the file media type pass true, otherwise pass false
    if(allowedFileTypes.includes(file.mimetype)){
        cb(null, true)
    } else {
        cb(null, false)
    }
}

require("dotenv").config();

// import profile schema
const ProfileModel = require('./models/profileModel')

const app = express();
const PORT = process.env.PORT;

// setting up middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json())
const upload = multer({storage: storage, fileFilter: fileFilter})
app.use(express.static('images'))

// Connect to MongoDB
mongoose.set('strictQuery', true);
async function connectToDB() {
    try{
        await mongoose.connect(process.env.MONGO_DB_URI)
        console.log('connection successful')
    } catch(e){
        console.log(`connection error ${e}`)
    }
}
connectToDB()

// get request to send all profiles to the frontend
app.get("/profiles", (req, res) => {
    
    async function getProfiles() {
        try{
            // using find() without anything in the parameters returns all documents
            const profiles = await ProfileModel.find()

            // send back response with data
            res.status(200).send({
                message: "profiles found",
                payload: profiles
            })
        }catch(e){
            // send back error message
            res.status(400).send({
                message: 'error in get request',
                data: e
            })
        }
    }

    getProfiles()
})

/** 
 * post request to make new users
 * middleware uploads a single file that has the name image in the input
 * */ 
app.post("/new-profile", upload.single('image'), (req, res) => {

    // get data from frontend request
    const data = req.body

    console.log(data)

    async function newProfile() {
        try{
            const newUser = await ProfileModel.create({
                pfp: req.file.filename,
                username: data.username,
                description: data.description
            })


            // send back response with data
            res.status(200).send({
                message: 'user created',
                payload: newUser
            })
        }catch(e){
            // send back error message
            res.status(400).send({
                message: 'error in post request',
                data: e
            })
        }
    }

    newProfile()
})

// delete request to delete profiles
app.delete('/delete-profile', (req, res) => {
    const data = req.query

    async function deleteProfile() {
        try{
            await ProfileModel.findByIdAndDelete(data.id)

            res.status(200).send({
                message: 'profile deleted'
            })
        } catch(e){
            res.status(400).send({
                message: 'error in delete request',
                data: e
            })
        }
    }

    deleteProfile()
})

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`)
})