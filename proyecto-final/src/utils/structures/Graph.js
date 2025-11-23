class Graph {
  constructor() {
    this.adjList = new Map();
  }

  addNode(uid) {
    if (!this.adjList.has(uid)) {
      this.adjList.set(uid, new Set());
    }
  }

  addEdge(a, b) {
    this.addNode(a);
    this.addNode(b);

    this.adjList.get(a).add(b);
    this.adjList.get(b).add(a);
  }

  removeEdge(a, b) {
    if (this.adjList.has(a)) {
      this.adjList.get(a).delete(b);
    }
    if (this.adjList.has(b)) {
      this.adjList.get(b).delete(a);
    }
  }

  getFriends(uid) {
    return Array.from(this.adjList.get(uid) || []);
  }

  areFriends(a, b) {
    return this.adjList.get(a)?.has(b) ?? false;
  }
}

export default Graph;
