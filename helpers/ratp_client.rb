require 'mechanize'

class RATP_Client
  def self.getMetroLinesFor(station)
    mechanize = Mechanize.new
    page = mechanize.post('http://www.ratp.fr/horaires/fr/ratp/metro', {
        "metroServiceStationForm[station]" => station.key,
        "metroServiceStationForm[service]" => 'PP'
      })

    lines = Array.new
    page.search('.nojs tbody tr').each do |line_hash|

      line = Line.new()
      line.station = station
      line.name = line_hash.at('img.ligne').attributes['alt'].text.gsub('Ligne','').strip

      line.destinations = Array.new
      line_hash.search('td a').each do |direction|
        destination = Destination.new()
        destination.line = line
        destination.direction = direction.attributes['href'].text.split('').last
        destination.name = direction.text
        line.destinations << destination
      end
      lines << line
    end

    return lines
  end

  def self.getMetroSchedulesFor(station, line, direction)
    mechanize = Mechanize.new
    url = "http://www.ratp.fr/horaires/fr/ratp/metro/prochains_passages/PP/#{station.key}/#{line}/#{direction}"
    page = mechanize.get(url)

    schedules = Array.new
    page.search('#prochains_passages tbody tr').each do |schedule_hash|
      schedule = Schedule.new()

      schedule.destination = schedule_hash.first_element_child.text
      raw_arriving = schedule_hash.last_element_child.text

      if raw_arriving.include?("mn")
        schedule.arriving = raw_arriving.gsub('mn','').strip.to_i * 60
        schedules << schedule
      elsif raw_arriving.include?("Train a l'approche") || raw_arriving.include?("Train a quai")
        schedule.arriving = 0
        schedules << schedule
      end

    end

    return schedules
  end
end