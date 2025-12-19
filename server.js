require("dotenv").config();
const express = require("express");
const path = require("path") // 
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// MIDDLEWARES
app.use(cors({ origin: "*" }));
app.use(express.json());

const userRoutes = require("./routes/userRoutes")
const sheltersRoutes= require("./routes/Shelter/shelterRoutes")
const petprofileRoutes=require("./routes/petProfileRoutes")

const PORT = process.env.PORT || 5050;
const userRoute = require('./routes/userRoutes')
app.use('/api/auth', userRoute);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// CONNECT DATABASE
connectDB();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", userRoutes)
app.use("/api/shelters", sheltersRoutes)
app.use("/api/pets",petprofileRoutes)



module.exports = app;