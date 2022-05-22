const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const configSchema = mongoose.Schema(
	{
		preview_length: { type: Number, required: true },
		pull_interval: { type: Number, required: true },
	},
	{ capped: { size: 1024, max: 1 } }
);

module.exports = mongoose.model("Config", configSchema);
