var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var cheerio = require('cheerio');

var db = require('monk')('localhost/transportapi');
var stations = db.get('stations');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/statics/home.json');
})

app.get('/:type/stations', function(req, res){
  if (req.params.type != 'metro') {
    res.status(422).json({'error':'only handling the metro for now'});
    return;
  };

  var query = {};
  var options = {sort: {name:1}};
  if (req.query.ll) {
    var ll = req.query.ll.split(',');
    for(var i=0; i<ll.length; i++) { ll[i] = +ll[i]; } 
    query['location'] = {$near:ll};
    options = {};
  }

  stations.find(query, options, function(error, results){
    for(var i=0; i<results.length; i++) { delete results[i]._id } 
    res.json({'stations':results});
  });
});

app.get('/:type/stations.html', function(req, res){
  if (req.params.type != 'metro') {
    res.status(422).json({'error':'only handling the metro for now'});
    return;
  };

  res.sendFile(__dirname + '/statics/stations-metro.html');
});

app.get('/:type/stations/:station/lines', function(req, res){
  if (req.params.type != 'metro') {
    res.status(422).json({'error':'only handling the metro for now'});
    return;
  };

  url = 'http://www.ratp.fr/horaires/fr/ratp/metro';
  form = {'metroServiceStationForm[station]' : req.params.station, 'metroServiceStationForm[service]' : 'PP'};
  request.post(url, {form: form}, function(error, response, result){
    if (error) {
      res.json({'error': error});
    }
    else {
      var lines = Array();
      var $ = cheerio.load(result);
      $('.nojs tbody tr').filter(function(){
        var destinations = Array();
        var line = $(this).find('img.ligne').first().attr('alt').replace('Ligne ','');
        $(this).find('td').each(function(){
          $(this).find('a').each(function(){
            var name = $(this).text();
            var uri = $(this).attr('href');
            var direction = uri.substring(uri.length -1, uri.length);

            destinations.push({'name' : name, 'direction' : direction, 'uri' : '/' + req.params.type + '/' + req.params.station + '/' + line + '/' + direction});
          });
        });
        lines.push({'line' : line, 'destinations' : destinations});
      });
      
      var result = {'type': req.params.type, 'line': req.params.line, 'lines': lines};
      res.json(result);
    }
  });
});

app.get('/:type/:station/:line/:direction', function(req, res){
  if (req.params.type != 'metro') {
    res.status(422).json({'error':'only handling the metro for now'});
    return;
  };

  station = req.params.station.replace(' ','+');
  url = 'http://www.ratp.fr/horaires/fr/ratp/metro/prochains_passages/PP/' + station + '/' + req.params.line + '/' + req.params.direction
  request(url, function(error, response, html) {
    if (error) {
      res.json({'error': error});
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