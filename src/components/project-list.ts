/// <reference path="./base-component.ts" />
/// <reference path="../interfaces/drag-drop.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../models/project.ts" />

namespace App {
  export class ProjectList
    extends Component<HTMLDivElement, HTMLElement>
    implements DragTarget
  {
    private assignedProjects: Project[];

    constructor(private type: "active" | "finished") {
      super("project-list", "app", false, `${type}-projects`);

      this.assignedProjects = [];

      this.configure();
      this.renderContent();
    }

    @Autobind
    dragOverHandler(event: DragEvent): void {
      if (event.dataTransfer && event.dataTransfer.types[0] == "text/plain") {
        event.preventDefault(); // prevent defaults tells the browser to allow drop.
        const listElement = this.element.querySelector(
          "ul"
        )! as HTMLUListElement;
        listElement.classList.add("droppable");
      }
    }

    @Autobind
    dropHandler(event: DragEvent): void {
      const projectId = event.dataTransfer!.getData("text/plain");
      projectState.changeProjectStatus(
        projectId,
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
      );
    }

    @Autobind
    dragLeaveHandler(_: DragEvent): void {
      const listElement = this.element.querySelector("ul")! as HTMLUListElement;
      listElement.classList.remove("droppable");
    }

    configure() {
      this.element.addEventListener("dragover", this.dragOverHandler);
      this.element.addEventListener("dragleave", this.dragLeaveHandler);
      this.element.addEventListener("drop", this.dropHandler);

      projectState.addListener((projects: Project[]) => {
        const projectStatus =
          this.type === "active"
            ? ProjectStatus.Active
            : ProjectStatus.Finished;

        this.assignedProjects = projects.filter(
          (project) => project.status === projectStatus
        );
        this.renderProjects();
      });
    }

    renderContent() {
      const listId = `${this.type}-projects-list`;
      this.element.querySelector("ul")!.id = listId;
      this.element.querySelector(
        "h2"
      )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
    }

    private renderProjects() {
      const listElement = document.getElementById(
        `${this.type}-projects-list`
      )! as HTMLUListElement;
      listElement.innerHTML = "";
      for (const projectItem of this.assignedProjects) {
        new ProjectItem(this.element.querySelector("ul")!.id, projectItem);
      }
    }
  }
}
