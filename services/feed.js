const { feedModel, postModel } = require("../models/feed");
const Joi = require("joi");
const mongoose = require("mongoose");
let Parser = require("rss-parser");
require("dotenv").config();

const checkRSS = async (url) => {
	let parser = new Parser({
		customFields: {
			feed: ["title", "link", "description"],
			item: [
				"title",
				"content",
				"image",
				"contentSnippet",
				"link",
				"pubDate",
			],
		},
	});

	try {
		let feedData = await parser.parseURL(url);
		return feedData;
	} catch (error) {
		return false;
	}
};

const pullPostsFromRSS = async (id) => {
	const feed = await getSingleFeed(id);
	let feedData = await checkRSS(feed.data.rssurl);
	let posts = feedData.items;
	let postData = [];
	console.log(posts);
	for (let i = 0; i < posts.length; i++) {
		let post = {
			title: posts[i].title,
			link: posts[i].link,
			date: posts[i].pubDate,
			content: posts[i].content,
			feed: id,
		};
		postData.push(post);
	}
	try {
		let post = await postModel.insertMany(postData);
		return post;
	} catch (error) {
		console.error(error);
		return false;
	}
};
const removeFeedPosts = async (id) => {
	if (!mongoose.Types.ObjectId.isValid(id)) return false;
	try {
		await postModel.deleteMany({ feed: id });
		return true;
	} catch (error) {
		return false;
	}
};

const addFeed = async (url) => {
	const regschema = Joi.object().keys({
		url: Joi.string().required().messages({
			"any.required": "Please input a valid url",
		}),
	});

	try {
		await regschema.validateAsync({ url });
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}

	try {
		const rss = await checkRSS(url);
		const result = await feedModel.create({
			title: rss.title,
			link: rss.link,
			rssurl: url,
			description: rss.description,
		});
		await pullPostsFromRSS(result._id);
		const success =
			"Feed added successfully. You can view all feeds in the feeds page";
		return { success: true, message: success, data: result };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};

const editFeed = async (id, feedBody) => {
	if (!mongoose.Types.ObjectId.isValid(id))
		return { success: false, message: "Invalid ID", data: {} };

	try {
		const update = await feedModel.findOneAndUpdate({ _id: id }, feedBody, {
			new: true,
		});
		return { success: true, message: "Successful", data: update };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};

const removeFeed = async (id) => {
	if (!mongoose.Types.ObjectId.isValid(id))
		return { success: false, message: "Invalid ID", data: {} };
	const deletePosts = await removeFeedPosts(id); //remove posts from feeds
	if (!deletePosts) return { success: false, message: "Error", data: {} };

	try {
		await feedModel.findByIdAndRemove(id);
		return { success: true, message: "Feed deleted", data: {} };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};

const getSingleFeed = async (id) => {
	try {
		const feeds = await feedModel.find({ _id: id });
		return { success: true, message: "", data: feeds[0] };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};
const getSinglePost = async (id) => {
	try {
		const posts = await postModel.find({ _id: id });
		return { success: true, message: "", data: posts[0] };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};
const getFeeds = async () => {
	try {
		const feeds = await feedModel.find();
		return { success: true, message: "", data: feeds };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};

const getPosts = async () => {
	try {
		const posts = await postModel.find();
		return { success: true, message: "Successful", data: posts };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};

module.exports = {
	addFeed,
	editFeed,
	removeFeed,
	getSingleFeed,
	getSinglePost,
	getFeeds,
	getPosts,
	checkRSS,
	pullPostsFromRSS,
};
