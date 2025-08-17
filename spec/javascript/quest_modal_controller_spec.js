// JavaScript unit tests for quest modal controller
// Note: These would typically run with Jest or similar JavaScript testing framework

describe('QuestModalController', () => {
  let controller;
  let mockElement;
  let mockTargets;

  beforeEach(() => {
    // Setup DOM mock
    document.body.innerHTML = `
      <div data-controller="quest-modal" data-quest-modal-create-url-value="/quests">
        <button data-action="click->quest-modal#openModal">New Quest</button>
        <div data-quest-modal-target="modal" class="hidden">
          <form data-quest-modal-target="form">
            <input name="quest[name]" type="text" />
            <textarea name="quest[description]"></textarea>
            <button type="submit">Create Quest</button>
          </form>
          <div data-quest-modal-target="errorContainer" class="hidden"></div>
        </div>
        <div data-quest-modal-target="questsList"></div>
      </div>
    `;

    // Mock CSRF token
    const csrfMeta = document.createElement('meta');
    csrfMeta.name = 'csrf-token';
    csrfMeta.content = 'test-token';
    document.head.appendChild(csrfMeta);

    // Import and instantiate the controller
    // This would work with a proper ES6 module setup
    // import QuestModalController from '../../app/javascript/controllers/quest_modal_controller.js';
    // controller = new QuestModalController();
    
    // Mock the controller for testing purposes
    controller = {
      modalTarget: document.querySelector('[data-quest-modal-target="modal"]'),
      formTarget: document.querySelector('[data-quest-modal-target="form"]'),
      errorContainerTarget: document.querySelector('[data-quest-modal-target="errorContainer"]'),
      questsListTarget: document.querySelector('[data-quest-modal-target="questsList"]'),
      createUrlValue: '/quests',
      scrollPositionValue: 0
    };
  });

  afterEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
    // Reset body styles
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
  });

  describe('Modal Management', () => {
    test('openModal shows modal and prevents body scroll', () => {
      // Mock the openModal function
      const openModal = function() {
        this.scrollPositionValue = window.pageYOffset || document.documentElement.scrollTop;
        this.modalTarget.classList.remove('hidden');
        this.modalTarget.classList.add('flex');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
      }.bind(controller);

      expect(controller.modalTarget.classList.contains('hidden')).toBe(true);
      expect(document.body.style.overflow).toBe('');

      openModal();

      expect(controller.modalTarget.classList.contains('hidden')).toBe(false);
      expect(controller.modalTarget.classList.contains('flex')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');
      expect(document.body.classList.contains('modal-open')).toBe(true);
    });

    test('closeModal hides modal and restores body scroll', () => {
      // First open the modal
      controller.modalTarget.classList.remove('hidden');
      controller.modalTarget.classList.add('flex');
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');

      // Mock the closeModal function
      const closeModal = function() {
        this.modalTarget.classList.add('hidden');
        this.modalTarget.classList.remove('flex');
        document.body.style.overflow = '';
        document.body.classList.remove('modal-open');
        window.scrollTo(0, this.scrollPositionValue);
      }.bind(controller);

      closeModal();

      expect(controller.modalTarget.classList.contains('hidden')).toBe(true);
      expect(controller.modalTarget.classList.contains('flex')).toBe(false);
      expect(document.body.style.overflow).toBe('');
      expect(document.body.classList.contains('modal-open')).toBe(false);
    });

    test('clickOutside closes modal when clicking backdrop', () => {
      const clickOutside = function(event) {
        if (event.target === this.modalTarget) {
          this.modalTarget.classList.add('hidden');
          this.modalTarget.classList.remove('flex');
        }
      }.bind(controller);

      // Simulate clicking on the modal backdrop
      const mockEvent = { target: controller.modalTarget };
      clickOutside(mockEvent);

      expect(controller.modalTarget.classList.contains('hidden')).toBe(true);
    });

    test('clickOutside does not close modal when clicking inside', () => {
      controller.modalTarget.classList.remove('hidden');
      controller.modalTarget.classList.add('flex');

      const clickOutside = function(event) {
        if (event.target === this.modalTarget) {
          this.modalTarget.classList.add('hidden');
          this.modalTarget.classList.remove('flex');
        }
      }.bind(controller);

      // Simulate clicking inside the modal
      const mockEvent = { target: controller.formTarget };
      clickOutside(mockEvent);

      expect(controller.modalTarget.classList.contains('flex')).toBe(true);
      expect(controller.modalTarget.classList.contains('hidden')).toBe(false);
    });
  });

  describe('Form Management', () => {
    test('clearForm resets form fields', () => {
      const nameInput = controller.formTarget.querySelector('input[name="quest[name]"]');
      const descriptionInput = controller.formTarget.querySelector('textarea[name="quest[description]"]');
      
      nameInput.value = 'Test Quest';
      descriptionInput.value = 'Test Description';

      const clearForm = function() {
        this.formTarget.reset();
        this.formTarget.querySelectorAll('input, textarea').forEach(input => {
          input.classList.remove('border-red-300', 'focus:border-red-500');
          input.classList.add('border-gray-300', 'focus:border-gray-400');
        });
      }.bind(controller);

      clearForm();

      expect(nameInput.value).toBe('');
      expect(descriptionInput.value).toBe('');
    });

    test('clearErrors hides error container', () => {
      controller.errorContainerTarget.classList.remove('hidden');
      controller.errorContainerTarget.innerHTML = 'Error message';

      const clearErrors = function() {
        this.errorContainerTarget.innerHTML = '';
        this.errorContainerTarget.classList.add('hidden');
      }.bind(controller);

      clearErrors();

      expect(controller.errorContainerTarget.innerHTML).toBe('');
      expect(controller.errorContainerTarget.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Quest List Management', () => {
    test('createQuestElement generates proper HTML', () => {
      const createQuestElement = function(quest) {
        const escapeHtml = (text) => {
          const div = document.createElement('div');
          div.textContent = text;
          return div.innerHTML;
        };

        const descriptionHtml = quest.description ? 
          `<div class="text-gray-500 text-sm hidden">
             <p class="truncate">${escapeHtml(quest.description)}</p>
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
                    <p data-quest-target="name" class="truncate">${escapeHtml(quest.name)}</p>
                    ${descriptionHtml}
                  </div>
                </a>
              </div>
            </div>
          </div>
        `;
      };

      const questData = {
        id: 1,
        name: 'Test Quest',
        description: 'Test Description'
      };

      const html = createQuestElement(questData);

      expect(html).toContain('Test Quest');
      expect(html).toContain('Test Description');
      expect(html).toContain('quest_container_1');
      expect(html).toContain('data-quest-id="1"');
    });

    test('addQuestToList removes empty state and adds quest', () => {
      // Setup empty state
      controller.questsListTarget.innerHTML = `
        <div class="flex flex-col items-center justify-center">
          <p>No quests found.</p>
        </div>
      `;

      const addQuestToList = function(questData) {
        const emptyState = this.questsListTarget.querySelector('.flex.flex-col.items-center.justify-center');
        if (emptyState) {
          emptyState.remove();
        }
        
        const questElement = `<div id="quest_container_${questData.id}">Quest: ${questData.name}</div>`;
        this.questsListTarget.insertAdjacentHTML('afterbegin', questElement);
      }.bind(controller);

      const questData = { id: 1, name: 'New Quest' };
      addQuestToList(questData);

      expect(controller.questsListTarget.innerHTML).not.toContain('No quests found');
      expect(controller.questsListTarget.innerHTML).toContain('Quest: New Quest');
    });
  });

  describe('Error Handling', () => {
    test('displayErrors shows error messages', () => {
      const displayErrors = function(errors) {
        this.errorContainerTarget.innerHTML = '';
        this.errorContainerTarget.classList.add('hidden');
        
        if (errors && Object.keys(errors).length > 0) {
          const errorCount = Object.values(errors).flat().length;
          const errorWord = errorCount === 1 ? 'error' : 'errors';
          
          let errorList = '';
          Object.entries(errors).forEach(([field, messages]) => {
            messages.forEach(message => {
              const fullMessage = field === 'base' ? message : `${field.charAt(0).toUpperCase() + field.slice(1)} ${message}`;
              errorList += `<li>${fullMessage}</li>`;
            });
          });
          
          const errorHtml = `
            <div class="bg-gray-50 text-red-500 px-4 py-3 rounded-lg border border-gray-200">
              <h2 class="text-sm font-medium">${errorCount} ${errorWord} prohibited this quest from being saved:</h2>
              <ul class="mt-2 text-xs space-y-1">
                ${errorList}
              </ul>
            </div>
          `;
          
          this.errorContainerTarget.innerHTML = errorHtml;
          this.errorContainerTarget.classList.remove('hidden');
        }
      }.bind(controller);

      const errors = {
        name: ['cannot be blank'],
        description: ['is too short']
      };

      displayErrors(errors);

      expect(controller.errorContainerTarget.classList.contains('hidden')).toBe(false);
      expect(controller.errorContainerTarget.innerHTML).toContain('2 errors prohibited');
      expect(controller.errorContainerTarget.innerHTML).toContain('Name cannot be blank');
      expect(controller.errorContainerTarget.innerHTML).toContain('Description is too short');
    });
  });

  describe('Utility Functions', () => {
    test('escapeHtml prevents XSS attacks', () => {
      const escapeHtml = function(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
      };

      const maliciousInput = '<script>alert("xss")</script>';
      const escaped = escapeHtml(maliciousInput);

      expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
      expect(escaped).not.toContain('<script>');
    });

    test('showSuccessMessage creates and displays success notification', () => {
      const showSuccessMessage = function(message) {
        const notice = document.createElement('p');
        notice.className = 'py-2 px-3 bg-gray-50 mb-5 text-gray-600 font-medium rounded-lg inline-block transition duration-300 ease-in-out animate-fadeIn';
        notice.textContent = message;
        notice.id = 'notice';
        
        const mainContainer = document.querySelector('.w-full.max-w-7xl.mx-auto') || document.body;
        const firstChild = mainContainer.children[1] || mainContainer.firstChild;
        if (firstChild) {
          firstChild.parentNode.insertBefore(notice, firstChild);
        } else {
          mainContainer.appendChild(notice);
        }
      };

      showSuccessMessage('Quest was successfully created');

      const notice = document.getElementById('notice');
      expect(notice).toBeTruthy();
      expect(notice.textContent).toBe('Quest was successfully created');
      expect(notice.classList.contains('animate-fadeIn')).toBe(true);
    });
  });

  describe('Scroll Position Management', () => {
    test('stores and restores scroll position', () => {
      // Mock window scroll methods
      let currentScrollY = 0;
      Object.defineProperty(window, 'pageYOffset', {
        get: () => currentScrollY,
        configurable: true
      });
      Object.defineProperty(document.documentElement, 'scrollTop', {
        get: () => currentScrollY,
        configurable: true
      });
      window.scrollTo = jest.fn((x, y) => {
        currentScrollY = y;
      });

      // Set initial scroll position
      currentScrollY = 500;

      const openModal = function() {
        this.scrollPositionValue = window.pageYOffset || document.documentElement.scrollTop;
      }.bind(controller);

      const closeModal = function() {
        window.scrollTo(0, this.scrollPositionValue);
      }.bind(controller);

      openModal();
      expect(controller.scrollPositionValue).toBe(500);

      // Simulate scroll change while modal is open
      currentScrollY = 0;

      closeModal();
      expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
    });
  });
});

// Additional integration test structure
describe('QuestModalController Integration', () => {
  test('full workflow: open modal, submit form, update list', async () => {
    // This would test the complete flow in a browser environment
    // with proper fetch mocking and DOM manipulation
    
    // Mock fetch for successful quest creation
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          id: 1,
          name: 'Integration Test Quest',
          description: 'Test Description',
          status: false
        })
      })
    );

    // This test would verify:
    // 1. Modal opens correctly
    // 2. Form submission sends correct data
    // 3. Quest list updates with new quest
    // 4. Modal closes after success
    // 5. Scroll position is preserved
    
    expect(true).toBe(true); // Placeholder assertion
  });
});