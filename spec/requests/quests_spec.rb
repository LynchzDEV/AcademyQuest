require 'rails_helper'

RSpec.describe "/quests", type: :request do
  let(:valid_attributes) {
    { name: "Request Test Quest", status: false }
  }

  let(:invalid_attributes) {
    { name: "", status: "invalid" }
  }

  describe "GET /index" do
    it "renders a successful response" do
      Quest.create! valid_attributes
      get quests_url
      expect(response).to be_successful
    end
  end

  describe "GET /show" do
    it "renders a successful response" do
      quest = Quest.create! valid_attributes
      get quest_url(quest)
      expect(response).to be_successful
    end
  end

  describe "GET /new" do
    it "renders a successful response" do
      get new_quest_url
      expect(response).to be_successful
    end
  end

  describe "GET /edit" do
    it "renders a successful response" do
      quest = Quest.create! valid_attributes
      get edit_quest_url(quest)
      expect(response).to be_successful
    end
  end

  describe "POST /create" do
    context "with valid parameters" do
      it "creates a new Quest" do
        expect {
          post quests_url, params: { quest: valid_attributes }
        }.to change(Quest, :count).by(1)
      end

      it "redirects to the created quest" do
        post quests_url, params: { quest: valid_attributes }
        expect(response).to redirect_to(quest_url(Quest.last))
      end
    end

    context "with invalid parameters" do
      it "does not create a new Quest" do
        expect {
          post quests_url, params: { quest: invalid_attributes }
        }.to change(Quest, :count).by(0)
      end

      it "renders the new template with unprocessable_entity status for HTML" do
        post quests_url, params: { quest: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response).to render_template(:new)
      end

      it "returns a 422 status for JSON format" do
        post quests_url, params: { quest: invalid_attributes }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end

  describe "PATCH /update" do
    context "with valid parameters" do
      let(:new_attributes) {
        { name: "Updated Request Quest", status: true }
      }

      it "updates the requested quest" do
        quest = Quest.create! valid_attributes
        patch quest_url(quest), params: { quest: new_attributes }
        quest.reload
        expect(quest.name).to eq("Updated Request Quest")
        expect(quest.status).to eq(true)
      end

      it "redirects to the quest" do
        quest = Quest.create! valid_attributes
        patch quest_url(quest), params: { quest: new_attributes }
        quest.reload
        expect(response).to redirect_to(quest_url(quest))
      end

      it "responds with JSON when format is JSON" do
        quest = Quest.create! valid_attributes
        patch quest_url(quest), params: { quest: new_attributes }, as: :json
        expect(response).to have_http_status(:ok)
        json_response = JSON.parse(response.body)
        expect(json_response["status"]).to eq("ok")
        expect(json_response["data"]["name"]).to eq("Updated Request Quest")
      end
    end

    context "with invalid parameters" do
      it "returns a 422 status code for JSON format" do
        quest = Quest.create! valid_attributes
        patch quest_url(quest), params: { quest: invalid_attributes }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it "renders the edit form for HTML format" do
        quest = Quest.create! valid_attributes
        patch quest_url(quest), params: { quest: invalid_attributes }
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response).to render_template(:edit)
      end
    end

  end

  describe "DELETE /destroy" do
    it "destroys the requested quest" do
      quest = Quest.create! valid_attributes
      expect {
        delete quest_url(quest)
      }.to change(Quest, :count).by(-1)
    end

    it "redirects to the quests list" do
      quest = Quest.create! valid_attributes
      delete quest_url(quest)
      expect(response).to redirect_to(quests_url)
    end

    it "returns no content when format is JSON" do
      quest = Quest.create! valid_attributes
      delete quest_url(quest), as: :json
      expect(response).to have_http_status(:no_content)
    end
  end
end
