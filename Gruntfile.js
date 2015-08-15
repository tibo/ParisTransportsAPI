module.exports = function(grunt) {
  grunt.initConfig({
    seed_stations : {

      metro : {
        dburl : 'localhost/transportapi',
        url : 'http://www.ratp.fr/horaires/js/liste-stations-metro-domaine-reel.js?culture=fr&theme=ratp'
      },
      other : {
        dburl : null,
        url : null
      }
    }
  });

  grunt.loadTasks('tasks');
};