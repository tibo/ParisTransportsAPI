class Destination
  attr_accessor :name
  attr_accessor :direction

  attr_accessor :line

  def as_json(options={})
    attrs = Hash.new()

    attrs["name"] = self.name
    attrs["direction"] = self.direction
    
    schedules_link = '/' + self.line.station.type + '/' + self.line.station.key + '/' + self.line.name + '/' + self.direction + '/schedules'
    attrs['links'] = [{'rel':'schedule','href':schedules_link}]

    attrs
  end
end