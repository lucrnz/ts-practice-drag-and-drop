// Drag & Drop Interfaces
// Read more about Drag on Drop:
// https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

export interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

export interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}
