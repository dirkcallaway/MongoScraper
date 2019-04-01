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

      //Take the result object and create in MongoDB
      db.Article.create(result)
        .then((dbArticle) => console.log("Articles Added to Mongo."))
        .catch((err) => console.log(err))
    });
    res.redirect("/");
  });
});

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

// Listen on port 3000
app.listen(3000, function () {
  console.log("App running on port 3000!");
});