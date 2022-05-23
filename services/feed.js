const { feedModel, postModel } = require("../models/feed");
const Joi = require("joi");
const mongoose = require("mongoose");
let Parser = require("rss-parser");
const moment = require("moment");
require("dotenv").config();

const checkRSS = async (url) => {
	let parser = new Parser({
		customFields: {
			feed: ["title", "link", "description"],
			item: [
				"title",
				"image",
				"contentSnippet",
				"link",
				"pubDate",
				"guid",
				["content:encoded", "fullcontent", { includeSnippet: true }],
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

	for (let i = 0; i < posts.length; i++) {
		let post = {
			title: posts[i].title,
			link: posts[i].link,
			date: posts[i].pubDate,
			content: posts[i].contentSnippet,
			contentsnippet: posts[i].contentSnippet,
			fullcontent: posts[i].fullcontent,
			fullcontentsnippet: posts[i].fullcontentSnippet,
			guid: posts[i].guid,
			feed: id,
		};
		postData.push(post);
	}
	try {
		// let post = await postModel.insertMany(postData);
		// return post;

		await postModel.bulkWrite(
			postData.map((doc) => ({
				updateOne: {
					filter: { link: doc.link, title: doc.title },
					// filter: { guid: doc.guid },
					update: doc,
					upsert: true,
				},
			}))
		);
		return true;
	} catch (error) {
		return false;
	}
};
const fetchLatestPosts = async () => {
	//fetch latest feeds and save to database
	try {
		const feedData = await getFeeds();
		const feeds = feedData.data;
		for (let i = 0; i < feeds.length; i++) {
			const feed = feeds[i];
			const posts = await pullPostsFromRSS(feed._id);
		}
		return true;
	} catch (error) {
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

const markAsRead = async (id) => {
	try {
		const post = await postModel.findOneAndUpdate(
			{ _id: id },
			{ read: true },
			{ new: true }
		);
		return true;
	} catch (error) {
		return false;
	}
};

const addFeed = async (url) => {
	const regschema = Joi.object().keys({
		url: Joi.string().uri().required().messages({
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
		const posts = await postModel.find({ _id: id }).populate("feed");
		await markAsRead(id);
		return { success: true, message: "", data: posts[0] };
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};
const getFeeds = async (perPage = 10, page = 1) => {
	try {
		let feedCount = 0;
		const feeds = await feedModel
			.find()
			.sort({ createdAt: "desc" })
			.skip(perPage * page - perPage)
			.limit(perPage);
		feedCount = await feedModel.countDocuments();

		return {
			success: true,
			message: "Successful",
			data: feeds,
			current: page,
			pages: Math.ceil(feedCount / perPage),
			total: feedCount,
			perPage: perPage,
		};
	} catch (error) {
		return { success: false, message: error.message, data: {} };
	}
};

const getPosts = async (perPage = 10, page = 1) => {
	try {
		let postCount = 0;
		const posts = await postModel
			.find()
			.sort({ date: "desc" })
			.skip(perPage * page - perPage)
			.limit(perPage)
			.populate("feed");
		postCount = await postModel.countDocuments();

		return {
			success: true,
			message: "Successful",
			data: posts,
			current: page,
			pages: Math.ceil(postCount / perPage),
			total: postCount,
			perPage: perPage,
		};
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
	fetchLatestPosts,
};
