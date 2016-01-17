module.exports = function(grunt) {
  
  grunt.initConfig({
    seed :{
      metro: {
        file : 'datas/metro.json'
      },
      other: {
        file : null
      }
    }
  });

  grunt.loadTasks('tasks');

};