class Board < ActiveRecord::Base
  has_many :board_samples
  has_many :samples, through: :board_samples

  def letters
    ["T", "Y", "U", "G", "H", "J", "B", "N", "M"] 
  end

  def get_samples
    self.board_samples.order(:pad_id).map {|bs| bs.sample}
  end

  def assign_pad(pad_id, sample_id)
    board_sample = self.board_samples.find_or_create_by(pad_id: pad_id)
    board_sample.sample_id = sample_id
    board_sample.save
  end
end
