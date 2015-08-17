var request = require('request');
var vm = require('vm');
var http = require('http');
var fs = require('fs');
var unzip = require('unzip');
var fstream = require('fstream');

module.exports = function(grunt) {

  function getLocationForStation(query, callback) {
    url = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + query + '&language=FR&components=country:France';

    request(url, function(error, response, result){
      parsedResult = JSON.parse(result);
      if (parsedResult['results'] && parsedResult['results'].length > 0) {
        firstResult = parsedResult['results'][0];

        location = firstResult['geometry']['location'];
        if (location  && location['lat'] && location['lng']) {
          grunt.log.writeln(query + '=> ' + location.lat + 'x' + location.lng);
        }
        else {
          grunt.log.writeln('no location for ' + query);
          grunt.log.writeln(url);
        }

        callback(location, error);
      }
      else {
        grunt.log.writeln(error);
        callback(null, error);
      }
    });
  }

  grunt.registerMultiTask('import_stations', 'Import stations', function() {
    var done = this.async();

    var db = require('monk')(this.data.dburl);
    var stations = db.get('stations');

    stations.remove();

    request(this.data.url, function(error, response, result){
      if (error) throw error;

      vm.runInThisContext(result);
      
      liste_stations_metro_domaine_reel.forEach(function(station){
        grunt.log.writeln(station['value']);

        var s = {type: 'metro', name: station['value'], key: station['key']};
        stations.insert(s);
      });

      db.close();
      done();

    });
  });

  grunt.registerMultiTask('geocode_stations', 'Geocode stations using Google API',function(){
    var done = this.async();

    var db = require('monk')(this.data.dburl);
    var stations = db.get('stations');

    geocodingQueue = Array();

    stations.find({}, function(error, results){
      geocodingQueue = results;
    })

    var t = setInterval(function(){
      if (geocodingQueue.length > 0) {
        station = geocodingQueue[geocodingQueue.length - 1];
        geocodingQueue.pop();

        query = 'metro paris ' + station.key;
        getLocationForStation(query, function(location, error){
          if (error) throw error;

          if (location) {
            stations.update({_id: station._id},{ $set: {lat: location['lat'], lng: location['lng']} });
          }
          else {
            grunt.log.writeln('no location for ' + station.key);
          }

        });
      }
      else {
        db.close();
        clearInterval(t);
        done();
      }
    }, 500);

  });
};