puts "Clearing existing quests..."
Quest.destroy_all

puts "Creating quests..."

quests = [
  { name: "First Day at TIPCO! Setup Macbooks and everything up!", description: "setup friendslog, basecamp, Tipco'card, door auth and necessary things required at odds", status: true, created_at: Time.parse("2024-01-06") },
  { name: "1st Finova's UX Field Research", description: "Finova project need some information about transaction of some banks", status: true, created_at: Time.parse("2024-01-10") },
  { name: "Friendslog Migration", description: "Current Friendslog is running on Rails 7.x.x. P'Ruuf want us to migrate it to 8.x.x.", status: false, created_at: Time.parse("2024-01-14") },
  { name: "2nd Finova's UX Field Research", description: "Finova project need some information about transaction of some banks", status: true, created_at: Time.parse("2024-01-17") },
  { name: "3rd Finova's UX Field Research", description: "Finova project need some information about transaction of some banks", status: true, created_at: Time.parse("2024-01-24") },
  { name: "Create Tipco's card template for printing", description: "P'Jeans create canvas for card template, we merge it into one paper for printable size", status: true, created_at: Time.parse("2024-02-3") },
  { name: "On Board people fron Sukhothai Thammathirat Open University that recently joinned", description: "More people more fun!", status: true, created_at: Time.parse("2024-02-18") },
  { name: "NVC Class", description: "non-violence communication class with P'Mho Phi", status: true, created_at: Time.parse("2024-03-03") },
  { name: "Scrum Class", description: "Scrum & Agile methodology class with odts", status: true, created_at: Time.parse("2024-03-04") },
  { name: "Ruby Class", description: "First time learning Ruby languege", status: true, created_at: Time.parse("2024-03-10") },
  { name: "Ruby On Rails Class", description: "Start Ruby On Rails Project with P'Mac", status: true, created_at: Time.parse("2024-03-11") },
  { name: "GIT Class", description: "Start GIT 101 with P'Champ", status: true, created_at: Time.parse("2024-03-17") },
  { name: "Agile Testing Class", description: "Learning about Agile Testing, Methodology", status: true, created_at: Time.parse("2024-03-18") },
  { name: "Playwright Testing", description: "Use knowledge from Agile Testing class with Playwright in this class", status: true, created_at: Time.parse("2024-03-21") },
  { name: "Container Fundamental", description: "Container Technology 101", status: true, created_at: Time.parse("2024-03-24") },
  { name: "Docker Class", description: "Learning about Docker and how to use it", status: true, created_at: Time.parse("2024-03-25") },
  { name: "CI on Gitlabs", description: "Class about Gitlabs CI with P'Dear", status: true, created_at: Time.parse("2024-03-26") },
  { name: "Jenkins Class", description: "Learning about Jenkins and how to use it with P'J", status: true, created_at: Time.parse("2024-03-27") },
  { name: "Figma Class", description: "Learning about Figma 101 and how to use it", status: true, created_at: Time.parse("2024-03-31") },
  { name: "BMA Project", description: "Start working BMA Project", status: false, created_at: Time.parse("2024-04-01") }
]

quests.each do |quest_data|
  quest = Quest.create!(quest_data)
  puts "Created quest: #{quest.name} (Status: #{quest.status ? 'Completed' : 'Incomplete'})"
end

puts "Seed completed: Created #{Quest.count} quests"
