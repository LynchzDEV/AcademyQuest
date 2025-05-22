require 'rails_helper'

RSpec.describe "Quest Interactions", type: :system do
  before do
    driven_by(:selenium_chrome_headless)
  end

  it "displays quests with appropriate styling based on status" do
    # Create test quests with specific statuses
    completed_quest = Quest.create!(name: "Completed Quest", status: true)
    pending_quest = Quest.create!(name: "Pending Quest", status: false)

    # Visit the index page
    visit quests_path

    # Verify that completed quests show as completed
    within("#quest_#{completed_quest.id}") do
      expect(page).to have_css(".line-through")
    end

    # Verify that pending quests show as pending
    within("#quest_#{pending_quest.id}") do
      expect(page).not_to have_css(".line-through")
    end
  end
end
