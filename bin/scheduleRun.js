const https = require("https");

//to make periodic request so heroku dynos can start up
https.get("https://code-rss.herokuapp.com/", (resp) => {
	console.log(resp.statusCode);
});
