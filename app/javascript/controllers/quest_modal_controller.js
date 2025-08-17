import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["modal", "form", "errorContainer", "questsList"];
  static values = { 
    createUrl: String,
    scrollPosition: Number 
  };

  connect() {
    // Initialize scroll position tracking
    this.scrollPositionValue = 0;
  }

  openModal() {
    // Store current scroll position
    this.scrollPositionValue = window.pageYOffset || document.documentElement.scrollTop;
    
    // Show modal
    this.modalTarget.classList.remove("hidden");
    this.modalTarget.classList.add("flex");
    
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    document.body.classList.add("modal-open");
    
    // Focus on the first input
    const firstInput = this.formTarget.querySelector("input[type='text'], textarea");
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
    
    // Add escape key listener
    document.addEventListener("keydown", this.handleEscape.bind(this));
  }

  closeModal() {
    // Hide modal
    this.modalTarget.classList.add("hidden");
    this.modalTarget.classList.remove("flex");
    
    // Restore body scroll
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
    
    // Restore scroll position
    window.scrollTo(0, this.scrollPositionValue);
    
    // Clear form and errors
    this.clearForm();
    this.clearErrors();
    
    // Remove escape key listener
    document.removeEventListener("keydown", this.handleEscape.bind(this));
  }

  handleEscape(event) {
    if (event.key === "Escape") {
      this.closeModal();
    }
  }

  clickOutside(event) {
    // Close modal if clicking on the backdrop
    if (event.target === this.modalTarget) {
      this.closeModal();
    }
  }

  async submitForm(event) {
    event.preventDefault();
    
    const formData = new FormData(this.formTarget);
    
    try {
      const response = await fetch(this.createUrlValue, {
        method: "POST",
        headers: {
          "X-CSRF-Token": document.querySelector("meta[name='csrf-token']").content,
          "Accept": "application/json"
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Success - add new quest to the list and close modal
        this.addQuestToList(data);
        this.closeModal();
        this.showSuccessMessage("Quest was successfully created.");
      } else {
        // Validation errors - display them in the modal
        this.displayErrors(data);
      }
    } catch (error) {
      console.error("Error creating quest:", error);
      this.displayErrors({ base: ["An unexpected error occurred. Please try again."] });
    }
  }

  addQuestToList(questData) {
    const questsList = this.questsListTarget;
    const emptyState = questsList.querySelector(".flex.flex-col.items-center.justify-center");
    
    // Remove empty state if it exists
    if (emptyState) {
      emptyState.remove();
    }
    
    // Create new quest element
    const questElement = this.createQuestElement(questData);
    
    // Add to top of the list (since they're ordered by created_at desc)
    questsList.insertAdjacentHTML("afterbegin", questElement);
    
    // Add animation
    const newElement = questsList.firstElementChild;
    newElement.style.opacity = "0";
    newElement.style.transform = "translateY(-20px)";
    
    requestAnimationFrame(() => {
      newElement.style.transition = "all 0.5s ease-out";
      newElement.style.opacity = "1";
      newElement.style.transform = "translateY(0)";
    });
  }

  createQuestElement(quest) {
    const descriptionHtml = quest.description ? 
      `<div class="text-gray-500 text-sm hidden">
         <p class="truncate">${this.escapeHtml(quest.description)}</p>
       </div>` : '';

    return `
      <div id="quest_container_${quest.id}" class="flex flex-col sm:flex-row justify-between items-start sm:items-center transition duration-300 ease-in-out animate-fadeInUp">
        <div class="w-full hover:bg-gray-50 transition-colors duration-200 rounded-lg flex justify-between items-center">
          <div class="w-4/5 flex items-center relative">
            <div class="absolute left-0 top-1/2 transform -translate-y-1/2 z-10" data-controller="quest">
              <input type="checkbox"
                  data-action="change->quest#toggle"
                  data-quest-id="${quest.id}"
                  class="mx-2 h-5 w-5 text-blue-600 border-gray-300 rounded">
            </div>
            <a href="/quests/${quest.id}" class="block w-full pl-8 py-3">
              <div data-quest-id="${quest.id}" class="w-full sm:w-auto">
                <p data-quest-target="name" class="truncate">${this.escapeHtml(quest.name)}</p>
                ${descriptionHtml}
              </div>
            </a>
          </div>
          <form action="/quests/${quest.id}" method="post" class="text-center rounded-full px-5 py-2 sm:bg-red-200 sm:hover:bg-gray-200 text-gray-700 font-medium transition duration-300 ease-in-out w-full sm:w-auto">
            <input type="hidden" name="_method" value="delete">
            <input type="hidden" name="authenticity_token" value="${document.querySelector("meta[name='csrf-token']").content}">
            <button type="submit" onclick="return confirm('Are you sure you want to remove this quest?')">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline-block text-red-500 sm:text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span class="ml-1 hidden sm:inline">Remove</span>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  displayErrors(errors) {
    this.clearErrors();
    
    if (errors && Object.keys(errors).length > 0) {
      const errorHtml = this.createErrorHtml(errors);
      this.errorContainerTarget.innerHTML = errorHtml;
      this.errorContainerTarget.classList.remove("hidden");
      
      // Scroll error container into view
      this.errorContainerTarget.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  createErrorHtml(errors) {
    const errorCount = Object.values(errors).flat().length;
    const errorWord = errorCount === 1 ? "error" : "errors";
    
    let errorList = "";
    Object.entries(errors).forEach(([field, messages]) => {
      messages.forEach(message => {
        const fullMessage = field === "base" ? message : `${field.charAt(0).toUpperCase() + field.slice(1)} ${message}`;
        errorList += `<li>${this.escapeHtml(fullMessage)}</li>`;
      });
    });
    
    return `
      <div class="bg-gray-50 text-red-500 px-4 py-3 rounded-lg border border-gray-200">
        <h2 class="text-sm font-medium">${errorCount} ${errorWord} prohibited this quest from being saved:</h2>
        <ul class="mt-2 text-xs space-y-1">
          ${errorList}
        </ul>
      </div>
    `;
  }

  clearErrors() {
    this.errorContainerTarget.innerHTML = "";
    this.errorContainerTarget.classList.add("hidden");
  }

  clearForm() {
    this.formTarget.reset();
    
    // Remove error styling from inputs
    this.formTarget.querySelectorAll("input, textarea").forEach(input => {
      input.classList.remove("border-red-300", "focus:border-red-500");
      input.classList.add("border-gray-300", "focus:border-gray-400");
    });
  }

  showSuccessMessage(message) {
    // Create and show a temporary success message
    const notice = document.createElement("p");
    notice.className = "py-2 px-3 bg-gray-50 mb-5 text-gray-600 font-medium rounded-lg inline-block transition duration-300 ease-in-out animate-fadeIn";
    notice.textContent = message;
    notice.id = "notice";
    
    // Insert after the first element in the main container
    const mainContainer = document.querySelector(".w-full.max-w-7xl.mx-auto");
    const firstChild = mainContainer.children[1]; // Skip the GitHub icon
    if (firstChild) {
      firstChild.parentNode.insertBefore(notice, firstChild);
    }
    
    // Remove the notice after 5 seconds
    setTimeout(() => {
      notice.style.opacity = "0";
      setTimeout(() => notice.remove(), 300);
    }, 5000);
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  disconnect() {
    // Cleanup when controller is disconnected
    document.removeEventListener("keydown", this.handleEscape.bind(this));
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
  }
}