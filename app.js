var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var cheerio = require('cheerio');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/statics/home.json');
})

app.get('/:type/:station/:line/:direction', function(req, res){
  if (req.params.type != 'metro') {
    res.json({'error':'only handling the metro for now'});
    return;
  };

  url = 'http://www.ratp.fr/horaires/fr/ratp/metro/prochains_passages/PP/' + req.params.station + '/' + req.params.line + '/' + req.params.direction
  request(url, function(error, response, html) {
    if (error) {
      res.status(422).json({'error': error});
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

      if (schedule.length == 0) {
        res.status(404).json({'error':'Something went wrong. Make sure to check the documentation http://localhost:3000/'});
        return;
      }

      var result = {'type': req.params.type, 'station': req.params.station, 'line': req.params.line, 'direction': req.params.direction, 'schedule': schedule};
      res.json(result);
    }
    
  });
  
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
})