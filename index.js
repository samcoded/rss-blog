const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const {
	viewPostsPage,
	viewFeedsPage,
	newFeedPage,
	updateFeedPage,
	newFeed,
	updateFeed,
} = require("./controllers/feed");

//Pages Routes
app.get("/", viewPostsPage); //load the default page containg all the posts
app.get("/feeds", viewFeedsPage); //load the feeds page
app.get("/feeds/add", newFeedPage); //load the add feed page
app.get("/feeds/:id", updateFeedPage); //load the update feed page

//API Routes
app.post("/feeds/add", newFeed); //add a new feed url
app.post("/feeds/:id", updateFeed); //update and delete the feed

//Database
const CONNECTION_URL = process.env.MONGOURL;
const PORT = process.env.PORT || 5000;
mongoose
	.connect(CONNECTION_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(console.log("Database connected"))
	.catch((error) => console.log(`${error} did not connect`));

app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
