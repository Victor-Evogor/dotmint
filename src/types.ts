export class StrokeCollection extends Array {
  push(...items: { position: [number, number]; color: string }[]) {
    for (const item of items) {
      if (!this.some((existing) => this.isEqual(existing, item))) {
        super.push(item);
      }
    }
    return this.length; // Return the new length of the array
  }

  // Helper method to compare two objects
  isEqual(
    obj1: { position: [number, number]; color: string },
    obj2: { position: [number, number]; color: string }
  ) {
    return (
      obj1.position[0] === obj2.position[0] &&
      obj1.position[1] === obj2.position[1] &&
      obj1.color === obj2.color
    );
  }

  clear() {
    this.length = 0;
  }

  // Method to delete an item by its x and y position
  deleteByPosition(x: number, y: number) {
    const index = this.findIndex(
      (item) => item.position[0] === x && item.position[1] === y
    );
    if (index !== -1) {
      this.splice(index, 1); // Remove the item at the found index
    }
    return this;
  }

  isPositionExist(x: number, y: number) {
    return this.some((item) => {
      return JSON.stringify(item.position) === JSON.stringify([x, y]);
    });
  }
}


export interface StateInterface {
  strokes: { position: [number, number]; color: string }[]
  backgroundColor: string
}

export class State {
  states: StateInterface[] = []
  restorableStates: StateInterface[] = []

  constructor() {
    this.states = []
    this.restorableStates = []
  }
  addState(newState: StateInterface) {
    if (!this.isEqual(newState)) {
      this.states.push(newState)
    }
  }

  isEqual(state: StateInterface) {
    return this.states.some((existing) => {
      return JSON.stringify(existing) === JSON.stringify(state)
    })
  }
}

export interface UserDB {
  id: string
  credits: number
  walletAddress: string
}