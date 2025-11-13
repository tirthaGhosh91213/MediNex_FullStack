import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb'

const app=express()
const port =  process.env.PORT ||4000
connectDB()

app.use(express.json());
app.use(cors())

app.get('/',(req,res)=>{
  res.send("API WORKING GREAT asjln sdd")
})

app.listen(port,()=>console.log("Server started ",port))