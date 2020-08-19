const RENDER_TO_DOM = Symbol("render to dom");

export class Component{
  constructor(){
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }
  setAttribute(name, value){
    this.props[name] = value;
  }
  appendChild(component){
    this.children.push(component);
  }
  get vdom(){
    this.render()[RENDER_TO_DOM](range)
  }
  get vchildren(){
    return this.children.map(child => child.vdom);
  }

  [RENDER_TO_DOM](range){
    this._range = range;
    this._vdom = this.vdom;
    this.render()[RENDER_TO_DOM](range);
  }
  update(oldNode){
    let isSameNode = (oldNode, newNode) => {
      if (oldNode.type !== newNode.type){
        return false;
      }
      for (const name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name]) {
          return false;
        }
      }
      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length){
        return false;
      }
      if (newNode.type === "#text") {
        if (newNode.content !== oldNode.content){
          return false;
        }
      }
      return true;
    }
    let update = (oldNode, newNode) => {
      // type,props, children 对比根节点是否一致，然后对比子节点是否一致
      // text,content
      if(isSameNode(oldNode, newNode)){
        newNode[RENDER_TO_DOM](oldNode._range);
        return;
      }
      newNode._range = oldNode_range;
      let newChildren = newNode.vchildren;
      let oldChildren = oldNode.vchildren;

      for (let i = 0; i <newChildren.length; i++) {
        let newChild = newChildren[i];
        let oldChild = oldChildren[i];
        let tailRange = oldChildren[newChildren.length - 1]._range;

        if (!newChildren || !newChildren.length) {
          return;
        }

        if (oldChildren.length) {
          update(oldChild, newChild);
        } else {
          let range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);
          newChild[RENDER_TO_DOM](range);
          tailRange = range;
        }
      }
    }
    let vdom = this.vdom
    update(this._vdom, vdom);
    this._vdom = vdom;
  }
  // rerender(){
  //   let oldRange = this._range;

  //   let range = document.createRange();
  //   range.setStart(this._range.startContainer, this._range.startOffset);
  //   range.setEnd(this._range.startContainer, this._range.startOffset);
  //   this[RENDER_TO_DOM](range);

  //   oldRange.setStart(range.endContainer, range.endOffset)
  //   oldRange.deleteContents();
  // }
  setState(newState){
    if(this.state === null || typeof this.state !== "object") {
      this.state = newState;
      this.rerender();
      return;
    }
    let merge = (oldState, newState) => {
      for(let p in newState) {
        if (typeof oldState[p] !== 'object' || oldState[p] === null) {
          oldState[p] = newState[p];
        } else {
          merge(oldState[p], newState[p])
        }
      }
    }
    merge(this.setState, newState);
    this.rerender();
  }
}
class ElementWrapper extends Component{
  constructor(type){
    super(type);
    this.type = type;
    this.root = document.createElement(type);
  }
  // setAttribute(name, value){
  //   if(name.match(/^on([\s\S]+)$/)){
  //     this.root.addEventListener(RegExp.$1.replace(/^[\s\S]$/, c => c.toLocaleLowerCase()), value)
  //   } else {
  //     if (name === "className") {
  //       this.root.setAttribute(name, value);
  //     } else {
  //       this.root.setAttribute(name, value);
  //     }
  //   }
  // }
  // appendChild(component){
  //   let range = document.createRange();
  //   range.setStart(this.root, this.root.childNodes.length);
  //   range.setEnd(this.root, this.root.childNodes.length);
  //   component[RENDER_TO_DOM](range);
  // }
  get vdom(){
    this.vchildren = this.children.map(child => child.vdom);
    return this;
  }
  
  [RENDER_TO_DOM](range){
    this._range = range;
    let root = document.createElement(this.type);
    for (const name in this.props) {
      let value = this.props[name];
      if (object.hasOwnProperty(key)) {
          if(name.match(/^on([\s\S]+)$/)){
            root.addEventListener(RegExp.$1.replace(/^[\s\S]$/, c => c.toLocaleLowerCase()), value)
          } else {
            if (name === "className") {
              root.setAttribute(name, value);
            } else {
              root.setAttribute(name, value);
            }
          }
      }
    }
    if (this.vchildren){
      this.vchildren = this.children.map(child => child.vdom);
    }
    
    for (const child of this.vchildren) {
          let childRange = document.createRange();
          childRange.setStart(root, root.childNodes.length);
          childRange.setEnd(root, root.childNodes.length);
          component[RENDER_TO_DOM](range);
    }
    replaceContent(range, root);
    range.insertNode(this.root);
  }
}

class TextWrapper extends Component{
  constructor(content){
    super(content)
    this.content = content;
    this.type = "#text";
  }
  get vdom(){
    return this;
  }
  [RENDER_TO_DOM](range){
    this._range = range;
    let root = document.createTextNode(this.content)
    replaceContent(range, root);
  }
}



function replaceContent(range, node){
  range.insertNode(node);
  range.setStartAfter(node);
  range.deleteContents();

  range.setStartBefore(node);
  range.setEndAfter(node);
}

export function  createElement(type, attrs, ...children) {
  let ele;
  if (typeof type === "string") {
    ele = new ElementWrapper(type);
  } else {
    ele = new type;
  }
  for (let p in attrs) {
    ele.setAttribute(p, attrs[p]);
  }
  let  insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === "string") {
        child =  new TextWrapper(child);
      }
      
      if (typeof child === null) {
        // child =  new TextWrapper(child);
        continue;
      }
      
      if (typeof child === "object" && (child instanceof Array)) {
        insertChildren(child);
      } else {
        ele.appendChild(child);
      }
    }
  }
  insertChildren(children);
  
  return ele;
}


export function render(component, parentElement){
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}