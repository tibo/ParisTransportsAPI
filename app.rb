require "sinatra"
require "sinatra/reloader" if development?

require './models/_init.rb'
require './helpers/_init.rb'

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

  get '/' do
    "Hello"
  end

  get '/stations' do
    content_type :json

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
    content_type :json

    station = Station.where(:key => station_key).first

    if station.nil?
      halt 404, {:error => "Invalid station"}.to_json
    end

    lines = RATP_Client.getMetroLinesFor(station)

    {'type':type,'station':station,'lines':lines}.to_json
  end

  get "/:type/:station/:line/:direction/schedules" do |type, station_key, line, direction|
    content_type :json

    station = Station.where(:key => station_key).first

    if station.nil?
      halt 404, {:error => "Invalid station"}.to_json
    end

    schedules = RATP_Client.getMetroSchedulesFor(station, line, direction)

    {'type':type,'line':line,'direction':direction,'station':station,'schedules':schedules}.to_json
  end

end