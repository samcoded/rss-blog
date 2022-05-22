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

const { getConfig, setConfig } = require("../services/config.js");

const viewSinglePost = async (req, res) => {
	const { id } = req.params;
	const post = await getSinglePost(id);
	if (post.success) return res.render("singlepost", { post: post.data });
	return res.render("singlepost", {
		error: true,
		message: post.message,
		title: "Error",
	});
};
const viewPostsPage = async (req, res) => {
	const perPage = 10;
	const page = req.query.page || 1;
	const posts = await getPosts(perPage, page);
	if (posts.success)
		return res.render("posts", {
			posts: posts.data,
			message: posts.message,
			current: posts.current,
			pages: posts.pages,
			total: posts.total,
			perPage: posts.perPage,
		});
	return res.render("posts", {
		posts: [],
		error: true,
		message: posts.message,
	});
};
const viewFeedsPage = async (req, res) => {
	const perPage = 10;
	const page = req.query.page || 1;
	const feeds = await getFeeds(perPage, page);
	const config = await getConfig();

	let renderData = {
		feeds: feeds.data,
		current: feeds.current,
		pages: feeds.pages,
		total: feeds.total,
		perPage: feeds.perPage,
		preview_length: config.preview_length,
		pull_interval: config.pull_interval,
	};
	const sess = req.session;
	if (sess.success) {
		renderData.success = true;
		renderData.message = sess.success;
		req.session.destroy();
	} else if (sess.error) {
		renderData.error = true;
		renderData.message = sess.error;
		req.session.destroy();
	}

	if (feeds.success) return res.render("feeds", renderData);
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

	if (feed.success) {
		req.session.success = "Feed added";
		return res.redirect(`/feeds`);
	}
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
		req.session.success = "Deleted";
		return res.redirect(`/feeds`);
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
