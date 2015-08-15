var request = require('request');
var vm = require('vm');

module.exports = function(grunt) {
  grunt.registerMultiTask('seed_stations', 'Seed stations', function() {
    var done = this.async();

    var db = require('monk')(this.data.dburl);
    var stations = db.get('stations');
    stations.remove();

    request(this.data.url, function(error, response, result){
      
      if (error) throw error;
      
      vm.runInThisContext(result);
      
      liste_stations_metro_domaine_reel.forEach(function(station){
        grunt.log.writeln(station['value']);
        stations.insert({name: station['value'], key: station['key']});
      });
      

      db.close();
      done();
    });

  });
};