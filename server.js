// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
const mongoose = require('mongoose');
var axios = require("axios");
var cheerio = require("cheerio");
var logger = require("morgan");

//Require Models
var db = require("./models");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Use morgan logger for logging requests
app.use(logger("dev"));
// Middleware
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
//Static Folder
app.use(express.static("public"));

// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");


// Database configuration
mongoose.connect('mongodb://localhost/coScraper', {
  useNewUrlParser: true
});


//Main Page Get Route
app.get("/", (req, res) => {
  db.Article.find({})
  .then(function(dbArticle){
    let hbsobj;
    hbsobj = {
      article: dbArticle
    };
    res.render("scraper", hbsobj);
  })
  .catch(function(err){
    res.json(err);
  })
});

//Scrape Route
app.get("/scrape", function (req, res) {
  axios.get("https://www.coloradoan.com/").then(function (response) {

    var $ = cheerio.load(response.data);

    // (i: iterator. element: the current element)
    $(".flm-asset").each(function (i, element) {

      // An empty array to save the data that we'll scrape
      var result = {};

      // Save the text of the element in title key
      result.title = $(element).find(".js-asset-headline").text().trim();

      //Finds the links in the articles
      result.link = "https://www.coloradoan.com" + $(element).find(".flm-asset-link").attr("href");

      result.summary = $(element).find(".js-asset-description").text().trim();

      //Take the result object and create in MongoDB
      db.Article.create(result)
        .then((dbArticle) => console.log("Articles Added to Mongo."))
        .catch((err) => console.log(err))
    });
    res.redirect("/");
  });
});

//Save a article
app.put("/favorite/:id", function(req, res){
  const id = req.params.id;
  db.Article.findOneAndUpdate({
    _id: id
  },
  {
    isFavorite: true
  })
  .then(function(){
    console.log("Favorite Added!")
    res.reload();
  })
  .catch(function(err){
    res.json(err)
  })
})

//Remove a Saved a article
app.put("/remove/:id", function(req, res){
  const id = req.params.id;
  db.Article.findOneAndUpdate({
    _id: id
  },
  {
    isFavorite: false
  })
  .then(function(){
    console.log("Favorite Removed!")
    res.reload();
  })
  .catch(function(err){
    res.json(err)
  })
})

//Remove a Saved a article
app.get("/notes/:id", function(req, res){
  const id = req.params.id;
  db.Note.find({
    _id: id
  })
  .then(function(){
    console.log("Notes Retrieved!")
    //res.reload(); Is this needed?
  })
  .catch(function(err){
    res.json(err)
  })
})

//Saved Articles
app.get("/saved", (req, res) => {
  db.Article.find({})
  .then(function(dbArticle){
    let hbsobj;
    hbsobj = {
      article: dbArticle
    };
    res.render("saved", hbsobj);
  })
  .catch(function(err){
    res.json(err);
  })
});

//Save Note
// Route for saving/updating an Article's associated Note
app.post("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  console.log(`The req is: ${req.body.noteBody}`)
  db.Note.create({
    body: req.body.noteBody
  })
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});