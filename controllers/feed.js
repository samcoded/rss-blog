const Joi = require("joi");
require("dotenv").config();

const {
	addFeed,
	editFeed,
	removeFeed,
	getSingleFeed,
	getSinglePost,
	getFeeds,
	getPosts,
} = require("../services/feed.js");

const viewSinglePost = async (req, res) => {
	const { id } = req.params;
	const post = await getSinglePost(id);
	if (post.success) return res.render("singlepost", { post: post.data });
	return res.render("singlepost", {
		error: true,
		message: post.message,
	});
};
const viewPostsPage = async (req, res) => {
	const posts = await getPosts();
	if (posts.success)
		return res.render("posts", {
			posts: posts.data,
			message: posts.message,
		});
	return res.render("posts", {
		posts: [],
		error: true,
		message: posts.message,
	});
};
const viewFeedsPage = async (req, res) => {
	const feeds = await getFeeds();
	if (feeds.success)
		return res.render("feeds", {
			feeds: feeds.data,
			message: feeds.message,
		});
	return res.render("feeds", {
		feeds: [],
		error: true,
		message: feeds.message,
	});
};

const newFeedPage = async (req, res) => {
	return res.render("addfeed");
};

const updateFeedPage = async (req, res) => {
	const { id } = req.params;
	const feed = await getSingleFeed(id);
	if (feed.success) return res.render("editfeed", { feed: feed.data });
	return res.render("editfeed", {
		error: true,
		message: feed.message,
	});
};
const newFeed = async (req, res) => {
	const { url } = req.body;
	const feed = await addFeed(url);
	if (feed.success) return res.redirect(`/feeds`);
	return res.render("addfeed", {
		error: true,
		message: feed.message,
	});
};

const updateFeed = async (req, res) => {
	const { id } = req.params;
	const { title, url, description } = req.body;
	const method = req.body._method;

	if (method && method == "delete") {
		const deleteFeed = await removeFeed(id);
		if (deleteFeed.success) {
			return res.redirect(`/feeds`);
		}
	}

	const updateFeed = await editFeed(id, { title, url, description });
	if (updateFeed.success)
		return res.render("editfeed", {
			success: true,
			message: updateFeed.message,
			feed: updateFeed.data,
		});

	const feed = await getSingleFeed(id);
	return res.render("editfeed", {
		error: true,
		message: updateFeed.message,
		feed: feed.data,
	});
};

module.exports = {
	viewSinglePost,
	viewPostsPage,
	viewFeedsPage,
	newFeedPage,
	updateFeedPage,
	newFeed,
	updateFeed,
};
