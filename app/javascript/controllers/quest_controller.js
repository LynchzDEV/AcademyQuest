import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["name"];

  connect() {}

  toggle(event) {
    // Remove preventDefault as we actually want the checkbox to change
    const checked = event.target.checked;

    // Get the quest ID from the checkbox's data attribute
    // (which we've already added to the checkbox)
    const questId = event.target.dataset.questId;

    fetch(`/quests/${questId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CSRF-Token": document.querySelector("meta[name='csrf-token']")
          .content,
      },
      body: JSON.stringify({
        quest: { status: checked },
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ok") {
          // Find all name targets with this quest ID and toggle their line-through class
          document
            .querySelectorAll(
              `[data-quest-id="${questId}"] [data-quest-target="name"]`,
            )
            .forEach((element) => {
              element.classList.toggle("line-through", checked);
            });
        }
      })
      .catch((error) => {
        console.error("Error updating quest:", error);
        event.target.checked = !checked;
      });
  }
}
