import { Controller } from "@hotwired/stimulus";

// Add global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('💥 Global JavaScript error:', event.error);
});

export default class extends Controller {
  static values = { questId: Number };
  static targets = [ "form", "button" ];
  
  constructor() {
    super(...arguments);
    this.isDeleting = false;
    this.abortController = null;
  }

  connect() {
    console.log("🔌 Quest delete controller connected!", this.element);
    console.log("🆔 Quest ID value:", this.questIdValue);
    console.log("🏷️ Element tag name:", this.element.tagName);
    console.log("🔍 Element classes:", this.element.className);
    
    // Ensure button is in correct initial state
    this.resetButtonState();
    
    // The controller is attached to the form element itself
    const form = this.element.tagName === 'FORM' ? this.element : this.element.querySelector('form') || this.element.closest('form');
    console.log("📝 Found form:", form);
    console.log("📝 Form action:", form?.action);
    console.log("📝 Form method:", form?.method);
    
    if (form) {
      console.log("🔗 Setting up form onsubmit handler");
      // Remove any existing onsubmit handler
      form.onsubmit = null;
      // Set our handler
      form.onsubmit = (event) => {
        console.log("📋 Form onsubmit triggered by:", event);
        return this.delete(event);
      };
    }
  }

  disconnect() {
    console.log("📡 Stimulus: quest-delete#disconnect");
    console.log("🧹 Cleaning up controller for quest:", this.questIdValue);
    
    // Cleanup when controller is removed
    if (this.abortController) {
      console.log("🛑 Aborting any pending request");
      this.abortController.abort();
    }
    this.isDeleting = false;
    console.log("✅ Controller cleanup complete");
  }

  delete(event) {
    console.log("🗑️ Delete method called with event:", event);
    console.log("🎯 Event target:", event.target);
    console.log("🔍 Event type:", event.type);
    console.log("🔍 Event defaultPrevented before:", event.defaultPrevented);
    console.log("🚫 Calling preventDefault...");
    
    // Immediately prevent default behavior
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    console.log("✅ preventDefault called successfully");
    console.log("🔍 Event defaultPrevented after:", event.defaultPrevented);
    
    // Additional form submission blocking
    if (event.target && event.target.tagName === 'FORM') {
      console.log("📋 Blocking form submission directly");
      event.target.onsubmit = () => false;
    }
    
    // Prevent multiple simultaneous delete operations
    if (this.isDeleting) {
      console.log("⚠️ Already deleting, aborting...");
      return false;
    }
    
    // Show confirmation dialog
    if (!confirm("Are you sure you want to remove this quest?")) {
      return false;
    }

    const questId = this.questIdValue;
    console.log("🆔 Processing deletion for quest ID:", questId);
    
    const questContainer = document.getElementById(`quest_container_${questId}`);
    console.log("📦 Quest container found:", questContainer);
    
    if (!questContainer) {
      console.error("❌ Quest container not found for ID:", questId);
      return false;
    }

    // Get the button and form elements
    const form = event.target.closest('form');
    const button = form ? form.querySelector('button') : event.target.closest('button');
    
    console.log("📝 Form element:", form);
    console.log("🔘 Button element:", button);
    
    if (!form || !button) {
      console.error("❌ Form or delete button not found");
      console.log("🔍 Event target:", event.target);
      console.log("🔍 Event target closest form:", event.target.closest('form'));
      return false;
    }

    // Get CSRF token from the form
    const csrfTokenField = form.querySelector('input[name="authenticity_token"]');
    const csrfToken = csrfTokenField ? csrfTokenField.value : document.querySelector("meta[name='csrf-token']")?.content;
    
    console.log("🔐 CSRF token field:", csrfTokenField);
    console.log("🔐 CSRF token found:", csrfToken ? "Yes" : "No");
    
    if (!csrfToken) {
      console.error("❌ CSRF token not found");
      console.log("🔍 Form inputs:", form.querySelectorAll('input'));
      console.log("🔍 Meta csrf token:", document.querySelector("meta[name='csrf-token']"));
      return false;
    }

    // Set deleting flag to prevent race conditions
    this.isDeleting = true;
    
    // Create abort controller for this request
    this.abortController = new AbortController();
    
    // Set loading state while preserving button dimensions
    this.setLoadingState(button);

    console.log("🚀 Starting AJAX DELETE request to:", `/quests/${questId}`);
    console.log("🔐 Using CSRF token:", csrfToken.substring(0, 10) + "...");
    
    fetch(`/quests/${questId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": csrfToken,
      },
      signal: this.abortController.signal
    })
      .then((response) => {
        console.log("📡 AJAX response received:", response);
        console.log("✅ Response status:", response.status);
        console.log("📊 Response ok:", response.ok);
        
        if (response.ok) {
          console.log("🎉 Quest deletion successful!");
          console.log("🎬 Starting quest removal animation...");
          
          // Animate quest removal
          this.animateRemoval(questContainer);
          this.showSuccessMessage();
          
          console.log("✨ Success message shown");
        } else {
          console.error("❌ AJAX request failed with status:", response.status);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      })
      .catch((error) => {
        console.log("🚨 AJAX request catch block triggered");
        console.log("🔍 Error name:", error.name);
        console.log("🔍 Error message:", error.message);
        
        // Don't show error if request was aborted (component unmounting)
        if (error.name === 'AbortError') {
          console.log("🛑 Request was aborted (controller disconnecting)");
          return;
        }
        
        console.error("💥 Error deleting quest:", error);
        this.showErrorMessage();
        this.resetButtonState(button);
      })
      .finally(() => {
        console.log("🏁 AJAX request finally block");
        console.log("🔄 Resetting deletion state...");
        
        // Reset state regardless of success/failure
        this.isDeleting = false;
        this.abortController = null;
        
        console.log("✅ State reset complete");
      });
    
    console.log("🛡️ Returning false to prevent any form submission");
    return false; // Prevent form submission
  }

  // Alternative method to handle button clicks directly  
  handleButtonClick(event) {
    console.log("🖱️ Button click detected:", event);
    console.log("🔍 Button event type:", event.type);
    console.log("🔍 Button event target:", event.target);
    
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    console.log("✅ Button click event prevented");
    
    // Find the form and trigger our delete method
    const form = event.target.closest('form');
    console.log("📝 Form found from button click:", form);
    
    if (form) {
      console.log("📝 Form found from button click, creating synthetic submit event");
      
      // Block the form's normal submission
      form.onsubmit = () => false;
      
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      Object.defineProperty(submitEvent, 'target', { value: form });
      
      console.log("🎭 Calling delete method with synthetic event");
      this.delete(submitEvent);
    } else {
      console.error("❌ No form found for button click");
    }
    
    console.log("🛡️ Button click handler returning false");
    return false;
  }

  setLoadingState(button) {
    if (!button) return;
    
    // Store original state
    const originalHTML = button.innerHTML;
    const originalWidth = button.offsetWidth;
    const originalHeight = button.offsetHeight;
    
    // Disable button interactions
    button.disabled = true;
    button.style.pointerEvents = 'none';
    button.style.opacity = '0.6';
    
    // Preserve button dimensions to prevent layout shift
    button.style.width = `${originalWidth}px`;
    button.style.height = `${originalHeight}px`;
    button.style.minWidth = `${originalWidth}px`;
    button.style.minHeight = `${originalHeight}px`;
    
    // Replace content with spinner that matches original icon size
    button.innerHTML = `
      <svg class="animate-spin h-5 w-5 inline-block text-red-500 sm:text-black" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="ml-1 hidden sm:inline">Removing...</span>
    `;
    
    // Store original content for restoration
    button.dataset.originalContent = originalHTML;
    button.dataset.originalWidth = originalWidth;
    button.dataset.originalHeight = originalHeight;
  }

  resetButtonState(button = null) {
    // If no button provided, try to find it
    if (!button) {
      const form = this.element.querySelector('form');
      button = form ? form.querySelector('button') : null;
    }
    
    if (!button) return;
    
    // Reset deleting flag
    this.isDeleting = false;
    
    // Re-enable button interactions
    button.disabled = false;
    button.style.pointerEvents = 'auto';
    button.style.opacity = '1';
    
    // Restore original dimensions
    button.style.width = '';
    button.style.height = '';
    button.style.minWidth = '';
    button.style.minHeight = '';
    
    // Restore original content if available
    if (button.dataset.originalContent) {
      button.innerHTML = button.dataset.originalContent;
      delete button.dataset.originalContent;
      delete button.dataset.originalWidth;
      delete button.dataset.originalHeight;
    }
  }

  animateRemoval(questContainer) {
    console.log("🎭 Starting quest removal animation for:", questContainer);
    
    // Add removal animation
    questContainer.style.transition = 'all 0.3s ease-out';
    questContainer.style.transform = 'translateX(-100%)';
    questContainer.style.opacity = '0';
    questContainer.style.height = questContainer.offsetHeight + 'px';

    console.log("🎬 Phase 1: Slide out animation started");

    // Wait for the slide animation to complete, then collapse height
    setTimeout(() => {
      console.log("🎬 Phase 2: Height collapse animation started");
      
      questContainer.style.height = '0px';
      questContainer.style.marginBottom = '0px';
      questContainer.style.paddingTop = '0px';
      questContainer.style.paddingBottom = '0px';
      
      // Remove from DOM after animation completes
      setTimeout(() => {
        console.log("🗑️ Removing quest container from DOM...");
        console.log("⚠️ This will cause the controller to disconnect");
        
        questContainer.remove();
        
        console.log("✅ Quest container removed from DOM");
        console.log("🔍 Checking if any quests remain...");
        
        this.checkIfNoQuestsRemain();
      }, 300);
    }, 300);
  }

  showSuccessMessage() {
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">Quest successfully removed!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  showErrorMessage() {
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full';
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">Failed to remove quest. Please try again.</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  checkIfNoQuestsRemain() {
    // Check if there are any quest containers left
    const questContainers = document.querySelectorAll('[id^="quest_container_"]');
    
    if (questContainers.length === 0) {
      // Show "no quests" message
      const questsList = document.getElementById('quests');
      if (questsList) {
        questsList.innerHTML = `
          <div class="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-2xl animate-fadeInUp animate-delay-300">
            <p class="text-gray-500 text-lg">No quests found.</p>
            <button data-action="click->quest-modal#openModal" class="mt-4 rounded-full px-5 py-2 bg-black hover:bg-gray-800 text-white font-medium transition duration-300 ease-in-out">Create your first quest</button>
          </div>
        `;
      }
    }
  }
}