class AddUserToSamples < ActiveRecord::Migration
  def change
    add_reference :samples, :user, index: true
    add_foreign_key :samples, :users
  end
end
