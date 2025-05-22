module QuestsHelper
  def status_badge(quest)
    if quest.status?
      content_tag(:span, "Completed", class: "px-3 py-1 text-sm rounded-full bg-green-100 text-green-800")
    else
      content_tag(:span, "Pending", class: "px-3 py-1 text-sm rounded-full bg-yellow-100 text-yellow-800")
    end
  end

  def format_date(date)
    date.strftime("%B %d, %Y at %I:%M %p")
  end
end
