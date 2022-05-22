const { setConfig } = require("../services/config.js");

const updateSiteConfig = async (req, res) => {
	const { pull_interval, preview_length } = req.body;
	const update = await setConfig({ preview_length, pull_interval });
	req.session.success = "Updated site config";
	return res.redirect("/feeds");
};

module.exports = {
	updateSiteConfig,
};
