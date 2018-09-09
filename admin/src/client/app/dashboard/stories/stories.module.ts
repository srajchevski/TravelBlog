import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { StoriesComponent } from './stories.component';

@NgModule({
    imports: [BrowserModule,FormsModule],
    declarations: [StoriesComponent],
    exports: [StoriesComponent]
})

export class StoriesModule { }
