class UpdateQuests < ActiveRecord::Migration[8.0]
  def change
    add_column :quests, :description, :text
  end
end
