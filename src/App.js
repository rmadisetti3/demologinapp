import React, { Component } from "react";
import { Button } from "react-bootstrap";
import Form from 'react-bootstrap/Form'
import Table from 'react-bootstrap/Table'
import * as $ from "axios";
import "./reset.css";
import "./App.css";

const Login = props => (
  <div className="loginblock">
    <form >
      <Form.Group controlId="email" bsSize="large">
        <Form.Label>Email: </Form.Label>
        <Form.Control
          autoFocus
          type="email"
          value={props.email}
          onChange={props.handleChangeEmail}
        />
      </Form.Group>
      <Form.Group controlId="password" bsSize="large">
        <Form.Label>Password: </Form.Label>
        <Form.Control
          autoFocus
          type="password"
          value={props.password}
          onChange={props.handleChangePassword}
        />
      </Form.Group>
      <p>Select Client</p>
      <select  onChange={props.handleChangeSelect}>
      {props.clients.map((client, i) => ( //creates options corresponding to the clients array from API
            <option
              name={client.name}
              value={client.clientId}
              key={i}>
              {client.name}
              </option>
              ))}
          </select>
      <Button onClick={props.handleSubmit}
      className="loginBtn"
      color="primary">
      Login
      </Button>
    </form>
  </div>
);

const ProjectTable = props => (
  <div>
    <Button 
    className="newProjectBtn"
    color="primary">
    + New Project</Button>
    <Table striped bordered hover>
  <thead>
    <tr>
      <th>Name</th>
      <th>Description</th>
      <th>Client</th>
      <th>Date Created</th>
      <th>Completed</th>
    </tr>
  </thead>
  {props.projects.map((project, i) => ( //creates corresponding rows for each project in the array from the API
            <tr
              key={i}>
              <td>{project.name}</td>
              <td>{project.description}</td>
              <td>{project.client.name}</td>
              <td>{project.dateCreated}</td>
              <td><input type="checkbox"></input></td>
              </tr>
              ))}
  </Table>;
  </div>

);

class App extends Component {
  state = {
    email: "",
    password: "",
    client: "",
    clients: [],
    clientID: "",
    token: "",
    projects: [],
    loginSuccess: false
  };

  componentDidMount() { //GET route when page loads to populate the dropdown menu on the login screen
    $.get("https://imswebapi.azurewebsites.net/api/clientmanager/clientlist").then(result => {
      this.setState({ clients: result.data });
      this.setState({ client: result.data[0].name });
      this.setState({ clientID: result.data[0].clientId });
    });
  }


  handleSubmit = event => { //function that executes when Login button is pressed: POST route to receive token for authentication
    event.preventDefault();
    var that = this;
    $.post("https://imswebapi.azurewebsites.net/api/user/login", {email: this.state.email, password: this.state.password, clientId: this.state.clientID
  }).then(result => {
    this.setState({ token: result.data.token });
      var clID = that.state.clientID;
      var token = that.state.token;
      $.get(`https://imswebapi.azurewebsites.net/api/client/${clID}/project/getprojectlist`, {headers: { //GET route to populate table with projects
        Authorization: 'Bearer ' + token 
      }
    })
      .then(result => {
        this.setState({ projects: result.data });
      })
      this.setState({ loginSuccess: true });
    }
    
  ).catch(result => { //if there is an error, alert the user
      alert("Invalid Login");
  })
}
  

  handleChangeEmail = event => {
    this.setState({ email: event.target.value });
  };

  handleChangePassword = event => {
    this.setState({ password: event.target.value });
  };

  handleChangeSelect = event => {
    this.setState({ client: event.target.name });
    this.setState({ clientID: event.target.value });
  };





  render() {
    return (
      <div>
        {this.state.loginSuccess ? (
          <ProjectTable 
          projects={this.state.projects}/>
        ) : (
          <Login 
          email={this.state.email}
          password={this.state.password}
          handleChangeEmail={this.handleChangeEmail}
          handleChangePassword={this.handleChangePassword}
          clients={this.state.clients}
          clientID={this.state.clientID}
          handleChangeSelect={this.state.handleChangeSelect}
          handleSubmit={this.handleSubmit}
          value={this.state.client}
          />
          
        )}
        
      </div>
    );
  }
}

export default App;
