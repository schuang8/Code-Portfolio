import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PropertyTreeModule } from './property-tree/property-tree.module';
import { WindowResizeService } from './services/window-resize.service';

import { CallService } from './services/call.service';
import { ProjectService } from './services/project.service';
import { MethodsService } from './services/methods.service';

import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    PropertyTreeModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    CallService,
    MethodsService,
    ProjectService,
    WindowResizeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
