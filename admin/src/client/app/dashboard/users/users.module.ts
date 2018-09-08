import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { UsersComponent } from './users.component';

@NgModule({
    imports: [BrowserModule,FormsModule],
    declarations: [UsersComponent],
    exports: [UsersComponent]
})

export class UsersModule { }
