import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { SessionPanelComponent } from './session-panel/session-panel.component';
import { UserComponent } from './user/user.component';
import { UserSelectComponent } from './user-select/user-select.component';
import { FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile.component';


@NgModule({
  declarations: [AuthComponent, SessionPanelComponent, UserComponent, UserSelectComponent, ProfileComponent],
  imports: [
    CommonModule,
		FormsModule,
    AuthRoutingModule
	],
	exports: [
		SessionPanelComponent,
		UserSelectComponent
	]
})
export class AuthModule { }
