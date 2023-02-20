// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

enum ProjectStatus {
  Active,
  Finished
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project state management
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }

    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numOfpeople: number) {
    const project = new Project(
      Math.random.toString(),
      title,
      description,
      numOfpeople,
      ProjectStatus.Active
    );

    this.projects.push(project);
    this.notifyListeners();
  }

  changeProjectStatus(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((project) => project.id === projectId);

    if (project && project.status != newStatus) {
      project.status = newStatus;
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

function Autobind(_: any, __: string, descriptor: PropertyDescriptor) {
  const method = descriptor.value;
  return {
    configurable: true,
    enumerable: false,
    get() {
      return method.bind(this);
    }
  } as PropertyDescriptor;
}

type InputValidation = {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
};

function validate(input: InputValidation) {
  let isValid = true;

  if (input.required) {
    isValid = isValid && input.value.toString().trim().length > 0;
  }

  if (input.minLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length > input.minLength;
  }

  if (input.maxLength != null && typeof input.value === "string") {
    isValid = isValid && input.value.length < input.maxLength;
  }

  if (input.min != null && typeof input.value === "number") {
    isValid = isValid && input.value >= input.min;
  }

  if (input.max != null && typeof input.value === "number") {
    isValid = isValid && input.value < input.max;
  }

  return isValid;
}

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get people(): string {
    return this.project.people === 1
      ? "1 person"
      : `${this.project.people} people`;
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  @Autobind
  dragEndHandler(_: DragEvent): void {
    console.log("Drag end");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = `${this.people} assigned`;
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

class ProjectList
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
      const listElement = this.element.querySelector("ul")! as HTMLUListElement;
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
        this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished;

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

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
      !validate({ value: enteredDescription, required: true, minLength: 10 }) ||
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

const projectInput = new ProjectInput();

const activeProjectList = new ProjectList("active");
const finishedProjectList = new ProjectList("finished");
