import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["name"];

  connect() {}

  toggle(event) {
    const checked = event.target.checked;
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
