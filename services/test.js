const cron = require("node-cron");
const { getConfig } = require("../services/config");

let cronJob;

const cronStart = async () => {
	const config = await getConfig();
	const timeCron = config.timeCron;
	cronJob = cron.schedule(
		timeCron,
		async () => {
			//RUN TASK here
		},
		{ scheduled: true }
	);
	cronJob.start();
	console.log("Cron started");
};

const cronRestart = async () => {
	cronJob.stop();
	console.log("Cron stopped");
	cronStart();
	console.log("Cron restarted");
};

module.exports = {
	cronStart,
	cronRestart,
};
