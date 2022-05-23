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

module.exports = {
	getConfig,
	setConfig,
};
