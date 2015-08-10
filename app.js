var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var cheerio = require('cheerio');

app.get('/', function(req, res){
  url = 'http://www.ratp.fr/horaires/fr/ratp/metro/prochains_passages/PP/mairie+de+clichy/13/A'
  request(url, function(error, response, html) {
    if (error) {
      res.send(error);
    }
    else {
      var schedule = Array();
      var $ = cheerio.load(html);
      $('#prochains_passages tbody tr').filter(function(){
        $(this).each(function() {
          var destination = $(this).children().first().text();
          var arriving = $(this).children().last().text();
          schedule.push({'destination' : destination, 'arriving' : arriving});
        });
      });
      res.send(schedule);
    }
    
  });
  
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
})