import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { CarouselModule } from 'ng2-bootstrap/ng2-bootstrap';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { DatepickerModule } from 'angular2-material-datepicker/index';

@NgModule({
    imports: [CommonModule, CarouselModule,DatepickerModule,ChartsModule],
    declarations: [HomeComponent],
    exports: [HomeComponent]
})

export class HomeModule { }
