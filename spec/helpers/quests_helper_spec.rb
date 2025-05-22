require 'rails_helper'

RSpec.describe QuestsHelper, type: :helper do
  describe "#status_badge" do
    it "returns a green badge for completed quests" do
      quest = Quest.new(name: "Test Quest", status: true)
      badge = helper.status_badge(quest)

      expect(badge).to include("bg-green-100")
      expect(badge).to include("text-green-800")
      expect(badge).to include("Completed")
      expect(badge).to include('<span')
      expect(badge).to include('</span>')
    end

    it "returns a yellow badge for pending quests" do
      quest = Quest.new(name: "Test Quest", status: false)
      badge = helper.status_badge(quest)

      expect(badge).to include("bg-yellow-100")
      expect(badge).to include("text-yellow-800")
      expect(badge).to include("Pending")
      expect(badge).to include('<span')
      expect(badge).to include('</span>')
    end

    it "returns a yellow badge for nil status" do
      quest = Quest.new(name: "Test Quest", status: nil)
      badge = helper.status_badge(quest)

      expect(badge).to include("bg-yellow-100")
      expect(badge).to include("Pending")
    end

    it "includes the expected CSS classes" do
      quest = Quest.new(name: "Test Quest", status: true)
      badge = helper.status_badge(quest)

      expect(badge).to include("px-3")
      expect(badge).to include("py-1")
      expect(badge).to include("text-sm")
      expect(badge).to include("rounded-full")
    end
  end

  describe "#format_date" do
    it "formats dates in a readable format" do
      date = Time.zone.parse("2023-01-15 14:30:00")
      expect(helper.format_date(date)).to eq("January 15, 2023 at 02:30 PM")
    end

    it "handles different dates correctly" do
      date = Time.zone.parse("2022-12-25 08:15:30")
      expect(helper.format_date(date)).to eq("December 25, 2022 at 08:15 AM")
    end

    it "handles nil dates gracefully" do
      expect { helper.format_date(nil) }.to raise_error(NoMethodError)
    end
  end
end
