const express = require('express')
const app = express()

app.get('/hello',(req,res)=>{
  res.send("Hello!")
})

app.listen(3000)




app.use((req,res,next)=>{
  console.log('Request aai',req.rul)
  next()
})


app.use((req,res,next)=>{
  console.log('Request aai',req.rul)
  
})




const http = require('http')


const server = http.createServer((req,res)=>{
  res.write('hello')
  res.end()
})


server.listen(3000)