var app = require('express')();
var http = require('http').Server(app);
var request = require('request');
var cheerio = require('cheerio');

var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/transportapi');
var stations = db.get('stations');

app.get('/', function(req, res){
  res.sendFile(__dirname + '/statics/home.json');
})

app.get('/stations', function(req, res){
  var query = {};
  var options = {sort: {name:1}};
  if (req.query.ll) {
    var ll = req.query.ll.split(',');
    for(var i=0; i<ll.length; i++) { ll[i] = +ll[i]; } 
    query['location'] = {$near:ll};
    options = {};
  }

  if (req.query.limit) {
    options['limit'] = req.query.limit;
  }

  stations.find(query, options, function(error, results){
    for(var i=0; i<results.length; i++) { 
      delete results[i]._id 
      if (req.query.device == 'pebble') {
        results[i].title = results[i].name
        results[i].subtitle = results[i].type
      }
    } 
    res.json({'stations':results});
  });
});

app.get('/stations.html', function(req, res){
  res.sendFile(__dirname + '/statics/stations.html');
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

            if (req.query.device == 'pebble') {
              destinations.push({'title' : name, 'direction' : direction});
            }
            else {
              destinations.push({'name' : name, 'direction' : direction});  
            }
            
          });
        });
        if (req.query.device == 'pebble') {
          lines.push({'title' : line, 'items' : destinations});
        }
        else {
          lines.push({'line' : line, 'destinations' : destinations});
        }
      });
      
      var result = {'type': req.params.type, 'line': req.params.line, 'lines': lines};
      res.json(result);
    }
  });
});

app.get('/:type/stations/:station/lines/:line/directions/:direction/schedules', function(req, res){
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
      var schedules = Array();
      var $ = cheerio.load(html);
      $('#prochains_passages tbody tr').filter(function(){
        $(this).each(function() {
          var destination = $(this).children().first().text();
          var arriving = $(this).children().last().text();
          if (req.query.device == 'pebble') {
            if (destination.length > 0) {
              if (arriving.length > 0) {
                schedules.push({'title' : destination, 'items' : [{'title' : arriving}]});  
              }
              else {
                schedules.push({'items' : [{'title' : destination}]});
              }
            }
          }
          else {
            if (destination.length > 0) {
              if (arriving.length > 0) {
                schedules.push({'destination' : destination, 'arriving' : arriving});  
              }
              else {
                schedules.push({'arriving' : destination});
              }
            }
          }
          
        });
      });

      var result = {'type': req.params.type, 'station': req.params.station, 'line': req.params.line, 'direction': req.params.direction};
      if (schedules.length > 0) {
        result['schedules'] = schedules;
      }
      else {
        if (req.query.device == 'pebble') {
          result['schedules'] = [{'items' : [{'title' : 'No service found.'}]}];
        }
        else {
          result['error'] = 'No service found.';
        }
      }

      res.json(result);
    }
    
  });
  
});

http.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
})