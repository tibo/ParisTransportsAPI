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
    done();
    return;

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

        query = 'metro ' + station.key;
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

  grunt.registerMultiTask('patch_datas','Hand made patch',function(){
    var done = this.async();

    var db = require('monk')(this.data.dburl);
    var stations = db.get('stations');

    stations.update({key: 'gabriel peri'},{ $set: {lat: 48.916574835983226, lng: 2.2943289646870606}});
    stations.update({key: 'creteil prefecture'},{ $set: {lat: 48.779777, lng: 2.459319}});
    stations.update({key: 'louise michel'},{ $set: {lat: 48.88864599999999, lng: 2.288158}});
    stations.update({key: 'anatole france'},{ $set: {lat: 48.892226, lng: 2.284904}});
    stations.update({key: 'villejuif leo lagrange'},{ $set: {lat: 48.804573, lng: 2.363943}});
    stations.update({key: 'aubervilliers pantin quatre chemins'},{ $set: {lat: 48.903799, lng: 2.3922195}});
    stations.update({key: 'charenton ecoles'},{ $set: {lat: 48.821649, lng: 2.413481}});
    stations.update({key: 'asnieres gennevilliers les courtilles'},{ $set: {lat: 48.930509, lng: 2.284362}});
    stations.update({key: 'pointe du lac'},{ $set: {lat: 48.768738, lng: 2.464319}});
    stations.update({key: 'robespierre'},{ $set: {lat: 48.855773, lng: 2.423451}});
    stations.update({key: 'saint denis universite'},{ $set: {lat: 48.94611087248738, lng: 2.3620451929905992}});
    stations.update({key: 'villejuif louis aragon'},{ $set: {lat: 48.786638011119834, lng: 2.367110527381649}});
    stations.update({key: 'pierre et marie curie'},{ $set: {lat: 48.815901, lng: 2.3773}});
    stations.update({key: 'jussieu'},{ $set: {lat: 48.8459684322046, lng: 2.3548073926942186}});
    stations.update({key: 'les agnettes'},{ $set: {lat: 48.92311100000001, lng: 2.286189}});
    stations.update({key: 'villejuif paul vaillant couturier'},{ $set: {lat: 48.796451, lng: 2.368267}});
    stations.update({key: 'liberte'},{ $set: {lat: 48.82659, lng: 2.405805}});
    stations.update({key: 'croix de chavaux'},{ $set: {lat: 48.858055, lng: 2.435764}});
    stations.update({key: 'hoche'},{ $set: {lat: 48.891275, lng: 2.402766}});
    stations.update({key: 'billancourt'},{ $set: {lat: 48.8322027, lng: 2.2384569}});
    stations.update({key: 'boulogne jean jaures'},{ $set: {lat: 48.841973, lng: 2.238786}});
    stations.update({key: 'les sablons'},{ $set: {lat: 48.880936, lng: 2.272485}});
    stations.update({key: 'bobigny pantin raymond queneau'},{ $set: {lat: 48.895488, lng: 2.425822}});
    stations.update({key: 'bobigny pablo picasso'},{ $set: {lat: 48.907147312551565, lng: 2.44945750453114}});
    stations.update({key: 'berault'},{ $set: {lat: 48.845443, lng: 2.42944}});
    stations.update({key: 'corentin celton'},{ $set: {lat: 48.827023, lng: 2.279373}});
    stations.update({key: 'creteil universite'},{ $set: {lat: 48.789842, lng: 2.45059}});
    stations.update({key: 'front populaire'},{ $set: {lat: 48.906675, lng: 2.365796}});
    stations.update({key: 'gallieni'},{ $set: {lat: 48.86326252650054, lng: 2.415975368499958}});
    stations.update({key: 'la courneuve 8 mai 1945'},{ $set: {lat: 48.9207697, lng: 2.4105603}});
    stations.update({key: 'maisons alfort les juilliottes'},{ $set: {lat: 48.803307, lng: 2.445681}});
    stations.update({key: 'maisons alfort stade'},{ $set: {lat: 48.809057, lng: 2.434641}});
    stations.update({key: 'marcel sembat'},{ $set: {lat: 48.833808586980275, lng: 2.243480614417395}});
    stations.update({key: 'ecole veterinaire de maisons alfort'},{ $set: {lat: 48.8148695637539, lng: 2.4216858672703037}});
    stations.update({key: 'saint mande'},{ $set: {lat: 48.84670269999999, lng: 2.4173165}});
    stations.update({key: 'pont de neuilly'},{ $set: {lat: 48.884702, lng: 2.260614}});
    stations.update({key: 'boulogne pont de saint cloud'},{ $set: {lat: 48.84088200000001, lng: 2.228449}});
    stations.update({key: 'malakoff plateau de vanves'},{ $set: {lat: 48.822574, lng: 2.298522}});
    stations.update({key: 'saint michel'},{ $set: {lat: 48.8532211, lng: 2.3442096}});
    stations.update({key: 'sully morland'},{ $set: {lat: 48.851721, lng: 2.361755}});
    stations.update({key: 'segur'},{ $set: {lat: 48.847443, lng: 2.306878}});
    stations.update({key: 'mouton duvernet'},{ $set: {lat: 48.831331, lng: 2.329845}});
    stations.update({key: 'garibaldi'},{ $set: {lat: 48.906169, lng: 2.3319871}});
    // stations.update({key: ''},{ $set: {lat: , lng: }});


    db.close();
    // done();
  })
};