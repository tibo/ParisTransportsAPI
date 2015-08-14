var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var cheerio = require('cheerio');
var vm = require('vm');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/statics/home.json');
})

app.get('/:type/stations', function(req, res){
  if (req.params.type != 'metro') {
    res.status(422).json({'error':'only handling the metro for now'});
    return;
  };

  url = 'http://www.ratp.fr/horaires/js/liste-stations-metro-domaine-reel.js?culture=fr&theme=ratp'
  request(url, function(error, response, result){
    if (error) {
      res.json({'error': error});
    }
    else {
      vm.runInThisContext(result);
      res.json(liste_stations_metro_domaine_reel);
    }
  });

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