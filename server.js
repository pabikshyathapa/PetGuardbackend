require("dotenv").config();
const express = require("express");
const path = require("path") // 
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// MIDDLEWARES
app.use(cors({ origin: "*" }));
app.use(express.json());

const sheltersRoutes= require("./routes/Shelter/shelterRoutes")
const petprofileRoutes=require("./routes/petProfileRoutes")
const ratingreviewRoutes=require("./routes/ratingreviewRoutes")
const favoriteRoutes=require("./routes/favouritesRoutes")
const notificationRoutes=require("./routes/Shelter/notificationRoutes")

const PORT = process.env.PORT || 5050;
const userRoute = require('./routes/userRoutes')
app.use('/api/auth', userRoute);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// CONNECT DATABASE
connectDB();
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/shelters", sheltersRoutes)
app.use("/api/pets",petprofileRoutes)
app.use("/api/reviews", ratingreviewRoutes);
app.use("/api/favorites",favoriteRoutes)
app.use("/api/notifications",notificationRoutes)


module.exports = app;