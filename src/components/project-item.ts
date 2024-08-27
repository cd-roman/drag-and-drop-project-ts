import { Draggable } from "../models/drag-drop.js";
import { Component } from "./base-component.js";
import { Project, ProjectStatus } from "../models/project.js";
import { autobind } from "../decorators/autobind.js";
import { projectState } from "../state/project-state.js";

export class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;
  private originalParent: HTMLElement | null = null;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
    event.dataTransfer!.setDragImage(this.element, 0, 0);
    this.originalParent = this.element.parentElement;
    setTimeout(() => {
      this.element.style.display = "none"; // Hide the element during drag
    }, 0);
    this.element.classList.add("dragging");
  }

  @autobind
  dragEndHandler(_: DragEvent) {
    this.element.style.display = "block"; // Show the element after drag
    const project = projectState.getProjectById(this.project.id);
    if (
      project &&
      project.status !== ProjectStatus.Active &&
      project.status !== ProjectStatus.Finished
    ) {
      this.originalParent!.appendChild(this.element); // Reinsert back to original parent if not dropped in a valid target
    }
    this.element.classList.remove("dragging");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }

  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}
