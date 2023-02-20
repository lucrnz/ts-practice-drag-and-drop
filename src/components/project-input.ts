/// <reference path="./base-component.ts" />
/// <reference path="../util/validation.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />

namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    private titleInputElement: HTMLInputElement;
    private descriptionInputElement: HTMLInputElement;
    private peopleInputElement: HTMLInputElement;

    constructor() {
      super("project-input", "app", true, "user-input");
      this.titleInputElement = this.element.querySelector(
        "#title"
      ) as HTMLInputElement;
      this.descriptionInputElement = this.element.querySelector(
        "#description"
      ) as HTMLInputElement;
      this.peopleInputElement = this.element.querySelector(
        "#people"
      ) as HTMLInputElement;
      this.configure();
    }

    configure() {
      this.element.addEventListener("submit", this.submitHandler);
    }

    renderContent() {}

    private gatherUserInput(): [string, string, number] | void {
      const enteredTitle = this.titleInputElement.value;
      const enteredDescription = this.descriptionInputElement.value;
      const enteredPeople = this.peopleInputElement.value;

      if (
        !validate({ value: enteredTitle, required: true, minLength: 5 }) ||
        !validate({
          value: enteredDescription,
          required: true,
          minLength: 10
        }) ||
        !validate({ value: Number(enteredPeople), required: true, min: 1 })
      ) {
        alert("Invalid input, please try again!");
        return;
      }

      return [enteredTitle, enteredDescription, Number(enteredPeople)];
    }

    private clearInputs() {
      this.titleInputElement.value = "";
      this.descriptionInputElement.value = "";
      this.peopleInputElement.value = "";
    }

    @Autobind
    private submitHandler(event: Event) {
      event.preventDefault();
      const userInput = this.gatherUserInput();

      if (Array.isArray(userInput)) {
        const [title, description, people] = userInput;
        projectState.addProject(title, description, people);
        this.clearInputs();
      }
    }
  }
}
