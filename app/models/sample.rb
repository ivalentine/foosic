class Sample < ActiveRecord::Base
  has_many :board_samples
  has_many :boards, through: :board_samples
  belongs_to :user
end
