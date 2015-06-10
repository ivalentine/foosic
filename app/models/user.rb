class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
    :recoverable, :rememberable, :trackable, :validatable

  # Add username
  validates :username, :presence => true, :uniqueness => true, :case_sensitive => false

  has_many :samples
  has_many :boards
  def connected_to_dropbox?
    !!self.dropbox_token
  end

end
