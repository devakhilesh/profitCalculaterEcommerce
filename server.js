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
app.get("/", async (req, res) => {
  return res.send("app is workring completely fine");
});

const ProfitHistory = require("./routes/profitRoute");

const auth = require("./routes/authRoute");

const platForm = require("./routes/platformRoute");

app.use("/user", ProfitHistory);

app.use("/auth", auth);

app.use("/platForm", platForm);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});
