const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const session = require("express-session");

const app = express();
dotenv.config();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.locals.moment = require("moment");
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	})
);

const { autoFetch } = require("./services/fetch");

app.use((req, res, next) => {
	autoFetch();
	next();
});

const {
	viewPostsPage,
	viewFeedsPage,
	newFeedPage,
	updateFeedPage,
	newFeed,
	updateFeed,
	viewSinglePost,
	viewFollowing,
} = require("./controllers/feed");
const { updateSiteConfig } = require("./controllers/config");

//Pages Routes
app.get("/", viewPostsPage); //load the default page containg all the posts
app.get("/following", viewFollowing); //load the following page
app.get("/feeds", viewFeedsPage); //load the manage feeds page
app.get("/feeds/add", newFeedPage); //load the add feed page
app.get("/feeds/:id", updateFeedPage); //load the update feed page
app.get("/post/:id", viewSinglePost); //load the default page containg all the posts

//API Routes
app.post("/feeds/add", newFeed); //add a new feed url
app.post("/feeds/config", updateSiteConfig); //update and delete the feed
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
