class Line
  attr_accessor :name
  attr_accessor :destinations

  attr_accessor :station

  def as_json(options={})
    attrs = super(options)
    
    attrs.delete("station")

    attrs
  end
end