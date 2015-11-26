import {Component} from 'angular2/angular2'
import {RouteParams, ROUTER_DIRECTIVES} from 'angular2/router';

@Component({
  selector: "hello",
  directives: [ROUTER_DIRECTIVES],
  templateUrl: './components/about.html'
})

export default class About {
  constructor() {
    console.log('About page called..');
  }
}