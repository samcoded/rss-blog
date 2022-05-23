const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const fetchSchema = mongoose.Schema(
	{
		description: { type: String, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Fetch", fetchSchema);
