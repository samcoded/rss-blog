const cron = require("node-cron");
const cronModel = require("../models/cron");
const { getConfig } = require("./config");
const { fetchLatestPosts } = require("./feed");

let cronJob;

const cronStart = async () => {
	const config = await getConfig();
	const pull_interval = config.pull_interval;
	cronJob = cron.schedule(
		`*/${pull_interval} * * * *`,
		async () => {
			await fetchLatestPosts();
			await cronModel.create({
				description: "Auto Cron",
			});
			const timenow = new Date().toString();
			console.log(`Auto Cron at ${timenow}`);
		},
		{ scheduled: true }
	);
	cronJob.start();
	console.log("Cron started");
};

const cronRestart = async () => {
	cronJob.stop();
	await cronStart();
	console.log("Cron restarted");
};

module.exports = {
	cronStart,
	cronRestart,
};
