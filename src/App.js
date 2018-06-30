import React, { Component } from 'react';
import './App.css';
import Navigation from './components/navigation/Navigation'
import Logo from './components/logo/Logo'
import Rank from './components/rank/Rank'
import ImageInput from './components/imageinput/ImageInput'
import FaceRecogition from './components/facerecogition/FaceRecogition'
import SignIn from './components/signin/SignIn'
import Register from './components/register/Register'
import Particles from 'react-particles-js';

 const parOptions = {
    particles: {
      number: {value: 30, density: {enable: true, value_area: 200}}}}

const intState = {
    input: '',
    imgUrl: '',
    box: {},
    info: ' ',
    route: 'signin',
    signedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}

class App extends Component {
  constructor() {
  super();
  this.state = intState;
  }

loadUser = (data) => {
  this.setState({user: {
          id: data.id,
          name: data.name,
          email: data.email,
          entries: data.entries,
          joined: data.joined
  }})
}

calculateFaceLocation = (data) => {
  const clarFace = data.outputs[0].data.regions[0].region_info.bounding_box
  const image = document.getElementById('inputImage');
  const width = Number(image.width);
  const height = Number(image.height);
  return {
    leftCol: clarFace.left_col * width,
    topRow: clarFace.top_row * height,
    rightCol: width - (clarFace.right_col * width),
    bottomRow: height - (clarFace.bottom_row * height),
  }
}

  faceAge = (data) => {
    const faceInfoArray = data.outputs[0].data.regions[0].data.face;
    console.log(faceInfoArray);
    return faceInfoArray.age_appearance.concepts[0].name;
  }

    faceEth = (data) => {
    const faceInfoArray = data.outputs[0].data.regions[0].data.face;
    return faceInfoArray.multicultural_appearance.concepts[0].name;
  }

    faceGen = (data) => {
    const faceInfoArray = data.outputs[0].data.regions[0].data.face;
    if (faceInfoArray.gender_appearance.concepts[0].name === 'feminine') {
      return 'woman'
    } else {return 'man'}
  }

displayInfo = (age, gen, eth) => {
  this.setState({info: `You are probably a ${age} year old ${eth} ${gen}.`})
}

displayBox = (box) => {
  this.setState({box: box})
}

onInputChange = (event) => {
  this.setState({input: event.target.value})
}

onSubmit = () => {
    this.setState({imgUrl: this.state.input});
      fetch('https://desolate-savannah-94391.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch('https://desolate-savannah-94391.herokuapp.com/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log)

        }
        this.displayBox(this.calculateFaceLocation(response)); this.displayInfo(this.faceAge(response), this.faceGen(response), this.faceEth(response))
      })
      .catch(err => console.log(err));
}

onRouteChange = (route) =>
{
  if (route === 'signout') {
    this.setState(intState)
  } else if (route === 'home') {
    this.setState({signedIn: true})
  }
  this.setState({route: route})
}

  render() {
    const { signedIn, imgUrl, route, box, info } = this.state;
    return ( 
      <div className="App">
        <Particles className='particles' params={parOptions} />
        <Navigation signedIn={signedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home' ? 
        <div>
          <Logo />
          <Rank name={this.state.user.name} entries={this.state.user.entries} />
          <ImageInput onInputChange={this.onInputChange} onSubmit={this.onSubmit} />
          <FaceRecogition info={info} box={box} imgUrl={imgUrl}/>
        </div>
        : (this.state.route === 'signin' ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
          : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange} />)
      }
      </div>
    );
  }
}

export default App;
