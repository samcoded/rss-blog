const fetchModel = require("../models/fetch");
const { getConfig } = require("../services/config");
const { fetchLatestPosts } = require("../services/feed");

const autoFetch = async () => {
	lastFetch = await fetchModel.findOne().sort({ createdAt: -1 });

	if (lastFetch !== null) {
		try {
			const config = await getConfig();
			const pull_interval = config.pull_interval;
			//run function date has passed
			const date = new Date();
			const diff = date.getTime() - lastFetch.createdAt.getTime();
			const diffMinutes = Math.round(diff / 1000 / 60);
			if (diffMinutes >= pull_interval) {
				//run function
				await fetchLatestPosts();
				await fetchModel.create({
					description: "Auto Fetch",
				});
				// console log current time to string
				const timenow = new Date().toString();
				console.log(`Auto Fetch at ${timenow}`);
			}
		} catch (error) {
			console.log(error);
		}
	} else {
		await fetchModel.create({
			description: "Start",
		});
	}
};

module.exports = {
	autoFetch,
};
