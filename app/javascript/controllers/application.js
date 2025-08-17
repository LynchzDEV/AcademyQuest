import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = true
window.Stimulus   = application

// Add debugging for Stimulus controller registration
application.logDebugActivity = (identifier, functionName, detail = {}) => {
  console.log(`📡 Stimulus: ${identifier}#${functionName}`, detail);
};

export { application }
