import { Component, OnInit } from '@angular/core';
import { HttpClient }         from '@angular/common/http';
import { RouterLink }         from '@angular/router';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h1>Student Dashboard</h1>
    <p>Backend says: {{ message }}</p>
    <a routerLink="">← Back</a>
  `,
})
export class StudentPage implements OnInit {
  message = '...loading';
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http
      .get<{ message: string }>('http://localhost:3000/') //change to actual backend
      .subscribe({
        next: (res) => (this.message = res.message),
        error: () => (this.message = 'Error contacting backend'),
      });
  }
}
