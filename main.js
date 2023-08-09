const express = require('express')
require('dotenv').config()

const app = express()
const routes = require('./routes/fileRoutes')


app.use('/api',  routes)

const port  = process.env.PORT
app.listen(port, ()=>{
    console.log(`you are in ${port}`  );
})



