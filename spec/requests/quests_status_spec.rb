require 'rails_helper'

RSpec.describe "Quest Status API", type: :request do
  describe "PATCH /quests/:id" do
    it "updates the quest status via JSON API" do
      quest = Quest.create!(name: "API Test Quest", status: false)

      # Make an API request to update the status
      patch quest_path(quest), params: { quest: { status: true } },
            headers: { "Accept" => "application/json" }

      # Check the response
      expect(response).to have_http_status(:ok)
      json_response = JSON.parse(response.body)
      expect(json_response["status"]).to eq("ok")
      expect(json_response["data"]["status"]).to eq(true)

      # Verify the database was updated
      quest.reload
      expect(quest.status).to eq(true)
    end
  end
end
