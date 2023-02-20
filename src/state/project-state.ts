namespace App {
  // Project state management
  type Listener<T> = (items: T[]) => void;

  abstract class State<T> {
    protected listeners: Listener<T>[] = [];

    addListener(listenerFn: Listener<T>) {
      this.listeners.push(listenerFn);
    }
  }

  export class ProjectState extends State<Project> {
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
        Math.random().toString(),
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

  export const projectState = ProjectState.getInstance();
}
