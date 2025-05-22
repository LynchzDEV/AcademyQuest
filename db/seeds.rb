unless ENV["RAILS_ENV"] == "test"
  puts "Clearing existing quests..."
  Quest.destroy_all

  puts "Creating quests..."

  quests = [
    { name: "Complete Ruby Basics Tutorial", status: true },
    { name: "Build a Simple CLI Application", status: true },
    { name: "Learn Rails MVC Architecture", status: true },
    { name: "Create First Rails Application", status: true },
    { name: "Implement User Authentication", status: false },
    { name: "Add API Endpoints", status: false },
    { name: "Write Test Suite", status: false },
    { name: "Deploy to Production", status: false },
    { name: "Optimize Database Queries", status: false },
    { name: "Implement Real-time Features", status: false }
  ]

  quests.each do |quest_data|
    quest = Quest.create!(quest_data)
    puts "Created quest: #{quest.name} (Status: #{quest.status ? 'Completed' : 'Incomplete'})"
  end

  puts "Seed completed: Created #{Quest.count} quests"
end
