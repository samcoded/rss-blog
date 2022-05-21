const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const feedSchema = mongoose.Schema(
	{
		title: { type: String, required: true },
		link: { type: String, required: true },
		rssurl: { type: String, required: true },
		description: { type: String, required: true },
	},
	{ timestamps: true }
);

const postSchema = mongoose.Schema(
	{
		title: { type: String, unique: true, required: true },
		content: { type: String, default: "" },
		link: { type: String, required: true },
		// image: { type: String, required: true },
		date: { type: Date, default: Date.now },
		feed: {
			type: Schema.Types.ObjectId,
			ref: "Feed",
			required: true,
		},
	},
	{ timestamps: true }
);

const feedModel = mongoose.model("Feed", feedSchema);
const postModel = mongoose.model("Post", postSchema);

module.exports = {
	feedModel,
	postModel,
};
