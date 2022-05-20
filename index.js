const express = require("express");

app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

//Routes
app.get("/", (req, res) => {
	res.render("index");
});

//Database

app.listen(PORT, () => console.log(`Server Running on Port ${PORT}`));
