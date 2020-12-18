// DotEnv configuration
require('dotenv').config()

// Project Modules
const UsersRoutes = require('./routes/UsersRoutes')
const MinistriesRoutes = require('./routes/MinistriesRoutes')
const HistoryRoutes = require('./routes/HistoryRoutes')
const NewsRoutes = require('./routes/NewsRoutes')
const ReflectionsRoutes = require('./routes/ReflectionsRoutes')
const ShepherdsRoutes = require('./routes/ShepherdRoutes')
const EventsRoutes = require('./routes/EventsRoutes')
const SocialMediaRoutes = require('./routes/SocialMediaRoutes')

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
app.use('/history', HistoryRoutes)
app.use('/news', NewsRoutes)
app.use('/reflections', ReflectionsRoutes)
app.use('/shepherds', ShepherdsRoutes)
app.use('/events', EventsRoutes)
app.use('/social', SocialMediaRoutes)

app.listen(8888)