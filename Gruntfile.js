module.exports = function(grunt) {
  
  grunt.initConfig({
    seed :{
      metro: {
        file : 'datas/metro.json',
        dburl : process.env.MONGOLAB_URI || 'localhost/transportapi'
      },
      other: {
        file : null,
        dburl : null
      }
    }
  });

  grunt.loadTasks('tasks');

};