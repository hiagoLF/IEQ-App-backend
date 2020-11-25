// DotEnv configuration
require('dotenv').config()

// Project Modules
const UsersRoutes = require('./routes/UsersRoutes')
const MinistriesRoutes = require('./routes/MinistriesRoutes')

// Node Modules
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan')

// Configurations
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(morgan('dev'))

mongoose.connect(
    'mongodb://localhost:27017/ieqapp', 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }
);

app.use('/users', UsersRoutes)
app.use('/ministry', MinistriesRoutes)

app.listen(8888)