require "sinatra"
require "sinatra/reloader" if development?

require './models/_init.rb'
require './helpers/_init.rb'

require 'redis'

class ParisTransportAPI < Sinatra::Base
  enable :logging

  configure :development do
    register Sinatra::Reloader
  end

  configure do
    Mongoid.load!('./config/mongoid.yml')
    Mongoid.logger.level = Logger::ERROR
    Moped.logger.level = Logger::ERROR
  end

  redis = Redis.new()

  before do
    content_type :json

  end

  get '/' do
    "Hello"
  end

  get '/stations' do
    if params[:ll].nil?
      halt 400, {:error => "Latitude and longitude required"}.to_json
    end

    latlong = params[:ll].split(',')

    if latlong.length != 2
      halt 400, {:error => "Invalid latitude and longitude"}.to_json
    end

    lat = latlong.first.to_f
    lng = latlong[1].to_f

    stations = Station.geo_near([ lat, lng ])

    {'stations':stations}.to_json
  end

  get '/:type/:station/lines' do |type, station_key|

    if type != "metro"
      halt 404, {:error => "Type of transport invalid"}.to_json
    end

    cache_key = type + station_key + "lines"

    from_cache = redis.get(cache_key)

    if !from_cache.nil?
      from_cache
    else
      station = Station.where(:key => station_key).first

      if station.nil?
        halt 404, {:error => "Invalid station"}.to_json
      end

      lines = RATP_Client.getMetroLinesFor(station)

      result = {'type':type,'station':station,'lines':lines}

      redis.set(cache_key, result.to_json)
      redis.expire cache_key, 3600

      result.to_json
    end
  end

  get "/:type/:station/:line/:direction/schedules" do |type, station_key, line, direction|
    if type != "metro"
      halt 404, {:error => "Type of transport invalid"}.to_json
    end

    station = Station.where(:key => station_key).first

    if station.nil?
      halt 404, {:error => "Invalid station"}.to_json
    end

    schedules = RATP_Client.getMetroSchedulesFor(station, line, direction)

    {'type':type,'line':line,'direction':direction,'station':station,'schedules':schedules}.to_json
  end

end