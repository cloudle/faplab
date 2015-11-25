import 'reflect-metadata'
import {Component, bootstrap} from 'angular2/angular2'

@Component({
  selector: "application",
  template: `
        <h1>Hello Angular 2!</h1>
    `
})

class AppComponent {
  constructor() {

  }
}

bootstrap(AppComponent);
