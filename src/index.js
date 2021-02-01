// DotEnv configuration
require('dotenv').config()

// Node Modules
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const mongoose = require('mongoose')

// Project Modules
const UsersRoutes = require('./routes/Users')
const PostsRoutes = require('./routes/Posts')
const EventsRoutes = require('./routes/Events')
const AlbumRoutes = require('./routes/Albuns')
const PostIndex = require('./routes/PostsIndex')

// Configurations
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'))
app.use(cors())

mongoose.connect(
    'mongodb://localhost:27017/ieqapp', 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }
);

// Routes Usage
app.use('/user', UsersRoutes)
app.use('/post', PostsRoutes)
app.use('/postindex', PostIndex)
app.use('/event', EventsRoutes)
app.use('/album', AlbumRoutes)


app.listen(8888)