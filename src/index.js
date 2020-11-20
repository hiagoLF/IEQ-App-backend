// Project Modules
const UsersRoutes = require('./routes/UsersRoutes')

// Node Modules
const mongoose = require('mongoose')
const express = require('express')

// Configurations
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
mongoose.connect(
    'mongodb://localhost:27017/ieqapp', 
    {
        useNewUrlParser: true, 
        useUnifiedTopology: true
    }
);

app.use(UsersRoutes)

app.listen(8888)