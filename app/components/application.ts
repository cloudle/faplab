import {Component, NgFor} from 'angular2/angular2'
import {ROUTER_DIRECTIVES, RouteConfig, Router, Location, Route} from 'angular2/router'

import {routes} from '../configs/routes'

@Component({
  selector: "application",
  templateUrl: './components/application.html',
  directives: [NgFor, ROUTER_DIRECTIVES]
})

@RouteConfig(routes)
export default class AppComponent {
  router: Router;
  location: Location;

  constructor(router: Router, location: Location) {
    this.router = router; this.location = location;
  }

  getLinkStyle(path) {
    if(path === this.location.path()){
      return true; }
    else if(path.length > 0){
      return this.location.path().indexOf(path) > -1;
    }
  }
}