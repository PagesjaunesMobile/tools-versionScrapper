var express = require('express');
var fs = require('fs');
var app     = express();
var gplay = require('google-play-scraper');
var cache = require('memory-cache');

app.set('port', (process.env.PORT || 5000));
var populateCache = function(json) {
  cache.put(json.appId, json, 1000 * 86400, function(key, value) {
    console.log(value);
  });
  console.log(json.version);
};
app.get('/p/:package', function(req, res){
  var key = req.params.package;
  //All the web scraping magic will happen here
  console.log(key);
  if(!cache.get(key))
  {
    gplay.app({appId: req.params.package})
    .then(populateCache, console.log).then((result) => {res.json(cache.get(key)); console.log("failed")})       
  } else
  {
    console.log("cached "+ cache.keys())
    res.json(cache.get(key))
  }
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

exports = module.exports = app;