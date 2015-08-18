module.exports = function(grunt) {
  
  grunt.initConfig({
    seed :{
      metro: {
        file : 'datas/metro.json',
        dburl : 'localhost/transportapi'
      },
      other: {
        file : null,
        dburl : null
      }
    }
  });

  grunt.loadTasks('tasks');

};