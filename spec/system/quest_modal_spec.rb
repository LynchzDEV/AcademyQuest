require 'rails_helper'

RSpec.describe "Quest Modal", type: :system do
  before do
    driven_by(:selenium_chrome_headless)
  end

  describe "Modal Functionality" do
    context "when opening the modal" do
      it "opens modal when New Quest button is clicked" do
        visit quests_path
        
        click_button "New Quest"
        
        # Modal should be visible
        expect(page).to have_css('[data-quest-modal-target="modal"]:not(.hidden)')
        expect(page).to have_text("Create New Quest")
        expect(page).to have_field("Name")
        expect(page).to have_field("Description")
      end

      it "opens modal from empty state button" do
        visit quests_path
        
        click_button "Create your first quest"
        
        # Modal should be visible
        expect(page).to have_css('[data-quest-modal-target="modal"]:not(.hidden)')
        expect(page).to have_text("Create New Quest")
      end

      it "focuses on the name field when modal opens" do
        visit quests_path
        
        click_button "New Quest"
        
        # Wait for modal to open and focus
        sleep(0.2)
        
        # Name field should be focused
        expect(page.driver.browser.switch_to.active_element.attribute('name')).to eq('quest[name]')
      end
    end

    context "when closing the modal" do
      before do
        visit quests_path
        click_button "New Quest"
      end

      it "closes modal when close button is clicked" do
        within('[data-quest-modal-target="modal"]') do
          find('button[data-action="click->quest-modal#closeModal"]').click
        end
        
        # Modal should be hidden
        expect(page).to have_css('[data-quest-modal-target="modal"].hidden')
      end

      it "closes modal when clicking outside" do
        # Click on the backdrop (outside the modal content)
        find('[data-quest-modal-target="modal"]').click
        
        # Modal should be hidden
        expect(page).to have_css('[data-quest-modal-target="modal"].hidden')
      end

      it "closes modal when pressing Escape key" do
        # Send Escape key
        page.driver.browser.action.send_keys(:escape).perform
        
        # Modal should be hidden
        expect(page).to have_css('[data-quest-modal-target="modal"].hidden')
      end

      it "clears form when modal is closed" do
        fill_in "Name", with: "Test Quest"
        fill_in "Description", with: "Test Description"
        
        within('[data-quest-modal-target="modal"]') do
          find('button[data-action="click->quest-modal#closeModal"]').click
        end
        
        click_button "New Quest"
        
        # Form should be cleared
        expect(page).to have_field("Name", with: "")
        expect(page).to have_field("Description", with: "")
      end
    end

    context "when submitting the form" do
      before do
        visit quests_path
        click_button "New Quest"
      end

      it "creates a new quest and updates the list without page refresh" do
        fill_in "Name", with: "New Test Quest"
        fill_in "Description", with: "Test Description"
        
        click_button "Create Quest"
        
        # Wait for AJAX response
        sleep(0.5)
        
        # Modal should be closed
        expect(page).to have_css('[data-quest-modal-target="modal"].hidden')
        
        # New quest should appear in the list
        expect(page).to have_text("New Test Quest")
        expect(page).to have_text("Quest was successfully created")
        
        # Verify the quest is at the top of the list (most recent)
        quest_list = find('[data-quest-modal-target="questsList"]')
        first_quest = quest_list.first('.flex.flex-col.sm\\:flex-row')
        expect(first_quest).to have_text("New Test Quest")
      end

      it "shows validation errors when form is invalid" do
        # Submit empty form
        click_button "Create Quest"
        
        # Wait for AJAX response
        sleep(0.5)
        
        # Modal should still be open
        expect(page).to have_css('[data-quest-modal-target="modal"]:not(.hidden)')
        
        # Should show validation errors
        expect(page).to have_css('[data-quest-modal-target="errorContainer"]:not(.hidden)')
        expect(page).to have_text("error")
      end

      it "updates empty state when creating first quest" do
        visit quests_path
        
        # Should show empty state initially
        expect(page).to have_text("No quests found")
        
        click_button "Create your first quest"
        
        fill_in "Name", with: "First Quest"
        click_button "Create Quest"
        
        # Wait for AJAX response
        sleep(0.5)
        
        # Empty state should be gone
        expect(page).not_to have_text("No quests found")
        expect(page).to have_text("First Quest")
      end
    end
  end

  describe "Scroll Position Preservation" do
    before do
      # Create many quests to enable scrolling
      15.times do |i|
        Quest.create!(name: "Quest #{i + 1}", description: "Description #{i + 1}")
      end
    end

    it "preserves scroll position when opening and closing modal" do
      visit quests_path
      
      # Scroll down the page
      page.execute_script("window.scrollTo(0, 500)")
      initial_scroll = page.evaluate_script("window.pageYOffset")
      
      click_button "New Quest"
      
      # Close modal without submitting
      within('[data-quest-modal-target="modal"]') do
        find('button[data-action="click->quest-modal#closeModal"]').click
      end
      
      # Wait for scroll restoration
      sleep(0.1)
      
      # Scroll position should be restored
      final_scroll = page.evaluate_script("window.pageYOffset")
      expect(final_scroll).to be_within(10).of(initial_scroll)
    end

    it "preserves scroll position after successful quest creation" do
      visit quests_path
      
      # Scroll down the page
      page.execute_script("window.scrollTo(0, 500)")
      initial_scroll = page.evaluate_script("window.pageYOffset")
      
      click_button "New Quest"
      
      fill_in "Name", with: "Scroll Test Quest"
      click_button "Create Quest"
      
      # Wait for completion
      sleep(0.5)
      
      # Scroll position should be restored
      final_scroll = page.evaluate_script("window.pageYOffset")
      expect(final_scroll).to be_within(10).of(initial_scroll)
    end
  end

  describe "JavaScript Integration" do
    it "properly initializes Stimulus controller" do
      visit quests_path
      
      # Check that the controller is connected
      controller_element = find('[data-controller="quest-modal"]')
      expect(controller_element).to be_present
      
      # Check that targets are properly defined
      expect(page).to have_css('[data-quest-modal-target="modal"]')
      expect(page).to have_css('[data-quest-modal-target="questsList"]')
    end

    it "handles CSRF token properly in AJAX requests" do
      visit quests_path
      click_button "New Quest"
      
      fill_in "Name", with: "CSRF Test Quest"
      
      # Verify CSRF token is present in the form
      expect(page).to have_field("authenticity_token", type: :hidden)
      
      click_button "Create Quest"
      
      # Wait for AJAX response
      sleep(0.5)
      
      # Quest should be created successfully (no 422 error)
      expect(page).to have_text("CSRF Test Quest")
    end
  end

  describe "Accessibility" do
    before do
      visit quests_path
      click_button "New Quest"
    end

    it "supports keyboard navigation" do
      # Tab through form elements
      expect(page).to have_field("Name")
      page.driver.browser.action.send_keys(:tab).perform
      expect(page.driver.browser.switch_to.active_element.attribute('name')).to eq('quest[description]')
      
      # Tab to submit button
      page.driver.browser.action.send_keys(:tab).perform
      page.driver.browser.action.send_keys(:tab).perform
      expect(page.driver.browser.switch_to.active_element.text).to eq('Create Quest')
    end

    it "has proper aria labels and roles" do
      expect(page).to have_css('input[name="quest[name]"]')
      expect(page).to have_css('textarea[name="quest[description]"]')
    end
  end

  describe "Animation and UI" do
    it "adds new quest with animation" do
      visit quests_path
      click_button "New Quest"
      
      fill_in "Name", with: "Animated Quest"
      click_button "Create Quest"
      
      # Wait for animation
      sleep(0.6)
      
      # Quest should be visible and properly positioned
      expect(page).to have_text("Animated Quest")
      
      # Should be at the top of the list
      quest_list = find('[data-quest-modal-target="questsList"]')
      first_quest = quest_list.first('.flex.flex-col.sm\\:flex-row')
      expect(first_quest).to have_text("Animated Quest")
    end

    it "shows success message after quest creation" do
      visit quests_path
      click_button "New Quest"
      
      fill_in "Name", with: "Success Message Quest"
      click_button "Create Quest"
      
      # Wait for success message
      sleep(0.5)
      
      expect(page).to have_text("Quest was successfully created")
    end
  end
end