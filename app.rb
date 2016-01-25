require "sinatra"
require "sinatra/reloader" if development?
require 'mechanize'

class ParisTransportAPI < Sinatra::Base
  enable :logging

  configure :development do
    register Sinatra::Reloader
  end

  configure do
  end

  get '/' do
    "Hello"
  end

  get '/:type/:station/lines' do |type, station|
    content_type :json

    mechanize = Mechanize.new
    page = mechanize.post('http://www.ratp.fr/horaires/fr/ratp/metro', {
        "metroServiceStationForm[station]" => station,
        "metroServiceStationForm[service]" => 'PP'
      })
    
    lines = Array.new
    page.search('.nojs tbody tr').each do |line|
      line_name = line.at('img.ligne').attributes['alt'].text.gsub('Ligne ','')
      l = {"line":line_name}
      l['destinations'] = Array.new
      line.search('td a').each do |direction|
        d = direction.attributes['href'].text.split('').last
        l['destinations'] << {"name":direction.text, "direction":d}
      end
      lines << l
    end

    {'type':type,'lines':lines}.to_json
  end

  get "/:type/:station/:line/:direction/schedules" do |type, station, line, direction|
    mechanize = Mechanize.new
    url = "http://www.ratp.fr/horaires/fr/ratp/metro/prochains_passages/PP/#{station}/#{line}/#{direction}"
    page = mechanize.get(url)

    page.body
  end

end