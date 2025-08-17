Rails.application.routes.draw do
  root "quests#index"
  resources :quests

  get "/brag", to: "brags#index", as: :brags
  get "/fun", to: "quests#fun", as: :fun_quests
  get "up" => "rails/health#show", as: :rails_health_check
  get "/health", to: "health#show", as: :health_check
end
