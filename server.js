var express = require('express');
var fs = require('fs');
var app     = express();
var gplay = require('google-play-scraper');
var cache = require('memory-cache');

app.set('port', (process.env.PORT || 5000));
var populateCache = function(json) {
  json.versionMin="8.5";
  cache.put(json.appId, json, 1000 * 86400, function(key, value) {
    console.log(value);
  });
  console.log(json.version);
};

//TODO set elems from query 
var populateCacheForDebug = function(json, key, params) {
  json.appId=key;
  json.version = params.version || "9.0.0";
  console.log(params);
  console.log("HERE");
  json.versionMin = params.version_min || "8.4.1.0";
//  console.log(json)
  cache.put(json.appId, json, 1000, function(key, value) {
    console.log(value);
  });
  console.log(json.version);
};

var isDebugMode = function(appId) {
  if(appId.indexOf(".latest") !== -1 ||
    appId.indexOf(".delivery") !== -1 ||
    appId.indexOf(".debug") !== -1)
    return true;

  return false;
}
var basePackage = function(appId){
  return  appId.replace(/\.(latest|delivery|beta)/,""); 
}

app.get('/p/:package', function(req, res){
  var key = req.params.package;
  
  //All the web scraping magic will happen here
  console.log(key);
  if(!cache.get(key))
  {
    if (isDebugMode(req.params.package)){
      gplay.app({appId: basePackage(key), lang:'fr'})
      .then((app) => populateCacheForDebug(app, key, req.query), console.log).then((result) => {
        res.json(cache.get(key));
        console.log("debug added")
      }) 
    } else    
    gplay.app({appId: key})
    .then(populateCache, console.log).then((result) => {
      res.json(cache.get(key));
      console.log(" added")
    })       
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