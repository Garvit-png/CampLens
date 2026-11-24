//express server

const express = require('express')
const app = express()

app.get('/hello',(req,res)=>{
  res.send("hello")
})

app.listen(3000)



//http server

const http = require('http')
const server = http.createServer((req,res)=>{
  res.writeHead('hello')
  res.end()
})

server.listen(3001)


//middleware 
const express = require('express')
const app = express()


app.use((req,res,next)=>{
  console.log('hello')
  next()
})

app.get('/hello',(req,res)=>{
  res.send("hello")
})

app.listen(3000)

//router 



const router = require('express.router')


