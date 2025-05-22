#!/usr/bin/env bash
set -o errexit

# ติดตั้ง gems และ assets
bundle install

# ถ้าใช้ Tailwind หรือ JS build
yarn install --check-files

# สร้าง assets
bundle exec rake assets:precompile
bundle exec rake assets:clean

# migrate database (Supabase)
bundle exec rake db:migrate
