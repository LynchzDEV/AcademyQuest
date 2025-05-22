class Quest < ApplicationRecord
  validates :name, presence: true
end
