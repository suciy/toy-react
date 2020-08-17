import { createElement, render, Component } from "./toy-react.js";

for(let i of [1, 2, 3]) {
  console.log(i)
}

class MyComponent extends Component{
  render(){
    return <div>
      <h1>MyComponent</h1>
      {this.children}
      </div>
  }
}


render.appendChild(<MyComponent id="a">
  <div>2</div>
  <div>3</div>
  <div>4</div>
</MyComponent>, document.body)

