const { cronRestart } = require("../services/cron");
const { setConfig, getConfig } = require("../services/config.js");

const updateSiteConfig = async (req, res) => {
	const { pull_interval, preview_length } = req.body;
	try {
		const oldConfig = await getConfig();
		const update = await setConfig({ preview_length, pull_interval });

		if (oldConfig.pull_interval != pull_interval) {
			cronRestart();
			//restart cron if pull interval changes
		}
		req.session.success = "Updated site config";
		return res.redirect("/feeds");
	} catch (error) {
		// req.session.error = "Could not update site config";
		req.session.error = error.message;
		return res.redirect("/feeds");
	}
};

module.exports = {
	updateSiteConfig,
};
