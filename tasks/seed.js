var fs = require('fs');

module.exports = function(grunt) {
  grunt.registerMultiTask('seed','Seed stations',function(){
    var done = this.async();

    var db = require('monk')(process.env.MONGOLAB_URI);
    var stations = db.get('stations');

    stations.remove();

    stations.index({ location: "2d" }, { min: -180, max: 180 });
    stations.index('key', { unique: true });

    var seed = JSON.parse(fs.readFileSync(this.data.file, 'utf8'));
    var seedStations = seed['stations'];

    seedStations.forEach(function(station){
      stations.insert({type: station.type, name: station.name, key: station.key, location: [station.lat, station.lng]} , function(error, result){
        if (error) throw error;

        if (station == seedStations[seedStations.length - 1]) {
          db.close();
          done();
        };
      });
    });

  });
};