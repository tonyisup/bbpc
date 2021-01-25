import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { SessionPanelComponent } from './session-panel/session-panel.component';


@NgModule({
  declarations: [AuthComponent, SessionPanelComponent],
  imports: [
    CommonModule,
    AuthRoutingModule
	],
	exports: [SessionPanelComponent]
})
export class AuthModule { }
