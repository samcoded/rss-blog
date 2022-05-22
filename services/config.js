const configModel = require("../models/config");

const setConfig = async (config) => {
	try {
		const setConfig = await configModel.create(config);
		return true;
	} catch (error) {
		return false;
	}
};

const getConfig = async () => {
	try {
		const config = await configModel.find();
		return config[0];
	} catch (error) {
		return false;
	}
};

if (getConfig() === false) {
	setConfig({ preview_length: 30, pull_interval: 3600 });
}

module.exports = {
	getConfig,
	setConfig,
};
