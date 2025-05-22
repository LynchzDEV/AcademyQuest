Rails.application.routes.draw do
  root "quests#index"
  resources :quests

  get "up" => "rails/health#show", as: :rails_health_check
end
