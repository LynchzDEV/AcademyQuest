require 'capybara/rails'
require 'selenium-webdriver'

Capybara.server = :puma, { Silent: true }

Capybara.register_driver :selenium_chrome_headless do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--headless=new')
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-dev-shm-usage')
  options.add_argument('--window-size=1920,1080')
  options.add_argument('--disable-gpu')

  Capybara::Selenium::Driver.new(
    app,
    browser: :chrome,
    options: options
  )
end

Capybara.javascript_driver = :selenium_chrome_headless

Capybara.default_max_wait_time = 10
