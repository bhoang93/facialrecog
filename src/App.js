import React, { Component } from "react";
import "./App.css";
import Navigation from "./components/navigation/Navigation";
import Logo from "./components/logo/Logo";
import Rank from "./components/rank/Rank";
import ImageInput from "./components/imageinput/ImageInput";
import FaceRecogition from "./components/facerecogition/FaceRecogition";
import SignIn from "./components/signin/SignIn";
import Register from "./components/register/Register";
import Particles from "react-particles-js";
import ErrorBound from "./components/ErrorBound";
import { Animated } from "react-animated-css";
import Modal from "./components/Modal/Modal";
import Profile from "./components/profile/Profile";

const parOptions = {
  particles: {
    number: { value: 30, density: { enable: true, value_area: 200 } }
  }
};

const intState = {
  input: "",
  imgUrl: "",
  boxes: [],
  info: " ",
  route: "signin",
  signedIn: false,
  isProfileOpen: false,
  animateInfo: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: ""
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = intState;
  }

  componentDidMount() {
    const token = window.localStorage.getItem("token");
    if (token) {
      fetch("http://localhost:3000/signin", {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        }
      })
        .then(resp => resp.json())
        .then(data => {
          if (data && data.id) {
            fetch(`http://localhost:3000/profile/${data.id}`, {
              method: "get",
              headers: {
                "Content-Type": "application/json",
                Authorization: token
              }
            })
              .then(resp => resp.json())
              .then(user => {
                if (user && user.email) {
                  this.loadUser(user);
                  this.onRouteChange("home");
                }
              });
          }
        })
        .catch(console.log);
    }
  }

  loadUser = data => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
      }
    });
  };

  calculateFaceLocation = data => {
    if (data && data.outputs) {
      return data.outputs[0].data.regions.map(face => {
        const clarFace = face.region_info.bounding_box;
        const image = document.getElementById("inputImage");
        const width = Number(image.width);
        const height = Number(image.height);
        return {
          leftCol: clarFace.left_col * width,
          topRow: clarFace.top_row * height,
          rightCol: width - clarFace.right_col * width,
          bottomRow: height - clarFace.bottom_row * height
        };
      });
    }
    return;
  };

  faceAge = data => {
    const faceInfoArray = data.outputs[0].data.regions[0].data.face;
    console.log(faceInfoArray);
    return faceInfoArray.age_appearance.concepts[0].name;
  };

  faceEth = data => {
    const faceInfoArray = data.outputs[0].data.regions[0].data.face;
    return faceInfoArray.multicultural_appearance.concepts[0].name;
  };

  faceGen = data => {
    const faceInfoArray = data.outputs[0].data.regions[0].data.face;
    if (faceInfoArray.gender_appearance.concepts[0].name === "feminine") {
      return "woman";
    } else {
      return "man";
    }
  };

  displayInfo = (age, gen, eth) => {
    this.setState({
      info: `You are probably a ${age} year old ${eth} ${gen}.`
    });
  };

  displayBox = boxes => {
    if (boxes) {
      this.setState({ boxes: boxes });
    }
  };

  onInputChange = event => {
    this.setState({ input: event.target.value });
  };

  onSubmit = () => {
    this.setState({ imgUrl: this.state.input });
    fetch("http://localhost:3000/imageurl", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: window.localStorage.getItem("token")
      },
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then(response => {
        if (response) {
          fetch("http://localhost:3000/image", {
            method: "put",
            headers: {
              "Content-Type": "application/json",
              Authorization: window.localStorage.getItem("token")
            },
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch(console.log);
        }
        this.displayBox(this.calculateFaceLocation(response));
        // this.displayInfo(this.faceAge(response), this.faceGen(response), this.faceEth(response));
        this.setState({ animateInfo: true });
      })
      .catch(err => console.log(err));
  };

  onRouteChange = route => {
    if (route === "signout") {
      return this.setState(intState);
    } else if (route === "home") {
      this.setState({ signedIn: true });
    }
    this.setState({ route: route });
  };

  toggleModal = () => {
    this.setState(prevState => ({
      ...prevState,
      isProfileOpen: !prevState.isProfileOpen
    }));
  };

  render() {
    const { signedIn, imgUrl, route, boxes, info, isProfileOpen } = this.state;
    return (
      <div className="App">
        <Particles className="particles" params={parOptions} />
        <Navigation
          signedIn={signedIn}
          onRouteChange={this.onRouteChange}
          toggleModal={this.toggleModal}
        />
        {isProfileOpen && (
          <Modal>
            <Profile
              user={this.state.user}
              loadUser={this.loadUser}
              toggleModal={this.toggleModal}
              isProfileOpen={isProfileOpen}
            />
          </Modal>
        )}
        {route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />
            <ErrorBound>
              <ImageInput
                onInputChange={this.onInputChange}
                onSubmit={this.onSubmit}
              />
            </ErrorBound>
            <FaceRecogition
              info={info}
              boxes={boxes}
              imgUrl={imgUrl}
              animateInfo={this.state.animateInfo}
            />
          </div>
        ) : this.state.route === "signin" ? (
          <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
