require 'rails_helper'

describe "Quest Page Test", type: :feature, js: true do
  before do
    create(:quest, name: "Sample Quest")
    visit quests_path
  end

  it "displays the quests index page" do
    expect(page).to have_selector("h1", text: "Quests")

    expect(page).to have_content("Sample Quest")
  end
end
