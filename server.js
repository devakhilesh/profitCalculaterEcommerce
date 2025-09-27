require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());

app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL_LOCAL)
  .then(() => {
    console.log(`mongo db connected successfully`);
  })

  .catch((err) => {
    console.log(err.message);
  });

  const path = require("path");

  const fs = require("fs");

  app.get("/SellingCalc", async (req, res) => {
return res.sendFile(path.join(__dirname, "calculatorNew.html")) ;
  }

)




app.get("/", async (req, res) => {
  return res.send("app is workring completely fine");
});


const routing = require("./routing/routing");

app.use("/", routing);



const port = process.env.PORT;

app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});
