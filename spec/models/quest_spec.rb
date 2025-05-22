require 'rails_helper'

RSpec.describe Quest, type: :model do
  describe "attributes" do
    it "has name and status attributes" do
      quest = Quest.new(name: "Test Quest", status: false)

      expect(quest.name).to eq("Test Quest")
      expect(quest.status).to eq(false)
    end

    it "can have a true status" do
      quest = Quest.new(name: "Test Quest", status: true)
      expect(quest.status).to eq(true)
      expect(quest.status?).to be true
    end

    it "can set attributes after initialization" do
      quest = Quest.new
      quest.name = "Changed Quest"
      quest.status = true

      expect(quest.name).to eq("Changed Quest")
      expect(quest.status).to be true
    end
  end

  describe "validations" do
    it "is valid with valid attributes" do
      quest = Quest.new(name: "Test Quest", status: false)
      expect(quest).to be_valid
    end

    it "is valid with only a name" do
      quest = Quest.new(name: "Test Quest")
      expect(quest).to be_valid
    end

    it "is not valid with only a status" do
      quest = Quest.new(status: true)
      expect(quest).not_to be_valid
      expect(quest.errors[:name]).to include("can't be blank")
    end

    it "is not valid with no attributes" do
      quest = Quest.new
      expect(quest).not_to be_valid
      expect(quest.errors[:name]).to include("can't be blank")
    end

    it "is not valid with a blank name" do
      quest = Quest.new(name: "", status: true)
      expect(quest).not_to be_valid
      expect(quest.errors[:name]).to include("can't be blank")
    end
  end

  describe "defaults" do
    it "has default status as nil when not specified" do
      quest = Quest.new(name: "Test Quest")
      expect(quest.status).to be_nil
    end
  end

  describe "persistence" do
    it "can be saved to the database" do
      quest = Quest.create(name: "Database Quest", status: true)
      expect(Quest.find(quest.id)).to eq(quest)
    end
  end
end
