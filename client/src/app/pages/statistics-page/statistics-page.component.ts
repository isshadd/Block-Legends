import { Component } from '@angular/core';
import { ClavardageComponent } from "../../components/clavardage/clavardage.component";

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [ClavardageComponent],
  templateUrl: './statistics-page.component.html',
  styleUrl: './statistics-page.component.scss'
})
export class StatisticsPageComponent {

}
