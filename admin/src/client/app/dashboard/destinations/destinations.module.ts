import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { DestinationsComponent } from './destinations.component';

@NgModule({
    imports: [BrowserModule,FormsModule],
    declarations: [DestinationsComponent],
    exports: [DestinationsComponent]
})

export class DestinationsModule { }
