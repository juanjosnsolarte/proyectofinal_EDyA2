class TreeNode {
  constructor(label, path = null) {
    this.label = label
    this.path = path
    this.children = []
  }

  addChild(childNode) {
    this.children.push(childNode)
  }

  hasChildren() {
    return this.children.length > 0
  }
}

export default TreeNode
