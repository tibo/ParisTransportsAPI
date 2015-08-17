var request = require('request');
var vm = require('vm');
var http = require('http');
var fs = require('fs');
var parse = require('csv-parse');


module.exports = function(grunt) {

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

  function removeAfter(string, expression) {
    if (string.indexOf(expression) > - 1) {
      return string.substring(0, string.indexOf(expression)-1);
    }

    return string;
  }

  grunt.registerMultiTask('match_locations', 'Match station with location from GTFS', function(){
    var done = this.async();

    var db = require('monk')(this.data.dburl);
    var stations = db.get('stations');    

    var parser = parse({delimiter: ','});

    var lines = Array();
    parser.on('readable', function(){
      while(record = parser.read()){
        lines.push(record);
      }
    });

    var readStream = fs.createReadStream(this.data.file);

    readStream.pipe(parser);
    parser.on('finish', function(){
      lines.forEach(function(line){
        // grunt.log.writeln('Processing: ' + line);
        csvName = line[2].toLowerCase();

        // grunt.log.writeln('before ' + csvName);

        csvName = removeAfter(csvName, 'metro');
        csvName = removeAfter(csvName, '-metro');
        csvName = removeAfter(csvName, '- metro');
        csvName = removeAfter(csvName, ' - metro');
        csvName = csvName.replace('é','e');
        csvName = csvName.replace('è','e');
        csvName = csvName.replace('à','e');
        csvName = csvName.replace('\'',' ');

        // grunt.log.writeln('after ' + csvName);

        // stations.find({key: 'republique'}, {}, function(error, results){
        stations.find({}, {}, function(error, results){
          // if (error) throw error;

          // if (results.lenght > 0) {
          //   grunt.log.writeln(csvName + ' = ' + results[0].key);
          // }
          // else {
          //   grunt.log.writeln('no results for name ' + csvName);
          // }

          grunt.log.writeln(results);
        });

        if (line == lines[lines.lenght - 1]) {
          db.close();
          done();
        }  
      });
    
      
    });
  });
};