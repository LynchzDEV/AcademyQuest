class HealthController < ApplicationController
  # Health check endpoint for monitoring and load balancers
  # Returns JSON with application health status and metrics
  
  def show
    health_data = {
      status: "ok",
      timestamp: Time.current.iso8601,
      version: Rails.application.config.version || "unknown",
      environment: Rails.env,
      checks: {
        database: database_check,
        redis: redis_check,
        disk_space: disk_space_check
      },
      metrics: {
        memory: memory_usage,
        uptime: uptime,
        db_connections: database_connections
      }
    }

    # Set overall status based on individual checks
    if health_data[:checks].values.all? { |check| check[:status] == "ok" }
      render json: health_data, status: :ok
    else
      health_data[:status] = "error"
      render json: health_data, status: :service_unavailable
    end
  rescue => e
    render json: {
      status: "error",
      error: e.message,
      timestamp: Time.current.iso8601
    }, status: :internal_server_error
  end

  private

  def database_check
    ActiveRecord::Base.connection.exec_query("SELECT 1")
    { status: "ok", message: "Database connection successful" }
  rescue => e
    { status: "error", message: "Database connection failed: #{e.message}" }
  end

  def redis_check
    if defined?(Redis)
      Redis.new(url: ENV.fetch("REDIS_URL", "redis://localhost:6379")).ping
      { status: "ok", message: "Redis connection successful" }
    else
      { status: "ok", message: "Redis not configured" }
    end
  rescue => e
    { status: "error", message: "Redis connection failed: #{e.message}" }
  end

  def disk_space_check
    disk_usage = `df -h #{Rails.root} | tail -1`.split
    usage_percent = disk_usage[4].to_i
    
    if usage_percent > 90
      { status: "warning", message: "Disk usage high: #{usage_percent}%" }
    elsif usage_percent > 95
      { status: "error", message: "Disk usage critical: #{usage_percent}%" }
    else
      { status: "ok", message: "Disk usage normal: #{usage_percent}%" }
    end
  rescue => e
    { status: "error", message: "Unable to check disk space: #{e.message}" }
  end

  def memory_usage
    if RUBY_PLATFORM.include?("linux")
      memory_kb = `cat /proc/#{Process.pid}/status | grep VmRSS`.split[1].to_i
      "#{(memory_kb / 1024.0).round(2)} MB"
    else
      "N/A"
    end
  rescue
    "N/A"
  end

  def uptime
    uptime_seconds = Time.current - Rails.application.config.boot_time
    "#{(uptime_seconds / 60).round(2)} minutes"
  rescue
    "N/A"
  end

  def database_connections
    ActiveRecord::Base.connection_pool.stat[:size] rescue "N/A"
  end
end