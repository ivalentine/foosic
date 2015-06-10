class CreateBoardSamples < ActiveRecord::Migration
  def change
    create_table :board_samples do |t|
      t.belongs_to :board, index: true
      t.belongs_to :sample, index: true
      t.integer :pad_id

      t.timestamps null: false
    end
    add_foreign_key :board_samples, :boards
    add_foreign_key :board_samples, :samples
  end
end
