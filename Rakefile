require 'rubygems'

ENV['RACK_ENV'] ||= 'development'

require 'mongoid'
require './models/station.rb'
require 'json'



namespace :import do
  Mongoid.load!('./config/mongoid.yml')
  Mongoid.logger.level = Logger::DEBUG
  Moped.logger.level = Logger::DEBUG
  
  desc "import metro stations"
  task :metro do
    file = File.read('./data/metro.json', :external_encoding => 'utf-8', :internal_encoding => 'utf-8')
    data = JSON.parse(file)

    data['stations'].each do |station_hash|
      station = Station.new()

      station.key = station_hash['key']
      station.location = [station_hash['lat'].to_f, station_hash['lng'].to_f]
      station.name = station_hash['name']
      station.type = station_hash['type']

      begin
        station.save 
        puts station_hash['key'] + " saved"
      rescue OperationFailure => e
        puts "error while saving: " + station_hash['key']
        puts e
        puts station_hash.to_s
      end
    end

    begin 
      Station.create_indexes
    rescue Object => e
      warn "error creating indexes on Station"
      warn "run: db.stations.ensureIndex({\"location\":\"2d\"}) to create it manualy"
    end
  end
end
