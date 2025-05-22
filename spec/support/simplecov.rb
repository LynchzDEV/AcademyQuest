require 'simplecov'

SimpleCov.start 'rails' do
  add_group "Helpers", "app/helpers"
  enable_coverage :branch
  minimum_coverage line: 70, branch: 50
  track_files "app/helpers/keycloaks_helper.rb"
end
