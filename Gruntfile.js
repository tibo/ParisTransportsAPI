module.exports = function(grunt) {

  grunt.initConfig({
    import_stations : {
      metro : {
        dburl : 'localhost/transportapi',
        url : 'http://www.ratp.fr/horaires/js/liste-stations-metro-domaine-reel.js?culture=fr&theme=ratp'
      },
      other : {
        dburl : null,
        url : null
      }
    },
    geocode_stations : {
      all : {
        dburl : 'localhost/transportapi'
      }
    },
    match_locations : {
      all : {
        dburl : 'localhost/transportapi',
        file : 'datas/stops.txt'
      }
    }
  });

  grunt.loadTasks('tasks');

};