import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieSelectComponent } from './components/movie-select/movie-select.component';
import { FormsModule } from '@angular/forms';
import { ListenOnComponent } from './components/listen-on/listen-on.component';



@NgModule({
  declarations: [
		MovieSelectComponent,
		ListenOnComponent
	],
  imports: [
    CommonModule,
		FormsModule
  ],
	exports: [
    MovieSelectComponent,
		ListenOnComponent
	],
})
export class AppCommonModule { }
