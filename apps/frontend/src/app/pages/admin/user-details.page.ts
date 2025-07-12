import { Component, effect, inject, model } from '@angular/core';
import { AttendanceService } from '../../shared/services/attendences.service';
import { Attendance, User } from '@etsecure/data-contracts';
import { ActivatedRoute } from '@angular/router';
import { UsersService } from '../../shared/services/users.service';
import { TimelineModule } from 'primeng/timeline';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-user-details',
  imports: [TimelineModule, CommonModule, CardModule],
  template: `
    <p-card>
      <h1>User Details</h1>
      @if(this.user()){
      <div class="flex flex-wrap gap-6">
        <div class="flex flex-col grow basis-0 gap-2">
          <strong>ID:</strong> {{ this.user()!._id }}
        </div>
        <div class="flex flex-col grow basis-0 gap-2">
          <strong>Authentik ID:</strong> {{ this.user()!.authentik_id }}
        </div>
        <div class="flex flex-col grow basis-0 gap-2">
          <strong>Name:</strong> {{ this.user()!.name }}
        </div>
        <div class="flex flex-col grow basis-0 gap-2">
          <strong>Username:</strong> {{ this.user()!.username }}
        </div>
        <div class="flex flex-col grow basis-0 gap-2">
          <strong>Email:</strong>
          {{ this.user()!.email }}
        </div>
      </div>
      @if(this.userAttendances() && this.userAttendances()!.length > 0) {
      <section>
        <h1>Attendances</h1>
        <div>
          <p-timeline [value]="userAttendances()">
            <ng-template #opposite let-event>
              <small class="text-surface-500 dark:text-surface-400">
                {{ event.timestamp | date : 'medium' }}
              </small>
            </ng-template>
            <ng-template #content let-event>
              {{ event.room.name }}
            </ng-template>
          </p-timeline>
        </div>
      </section>
      } }
    </p-card>
  `,
})
export class UserDetailsPage {
  public userAttendances = model<Attendance[]>();

  public user = model<User | null>(null);

  private _activatedRoute = inject(ActivatedRoute);
  private _attendanceService = inject(AttendanceService);
  private _usersService = inject(UsersService);

  constructor() {
    effect(async () => {
      this.user.set(
        await this._usersService.getUserById(
          this._activatedRoute.snapshot.params['id']
        )
      );

      if (this.user()) {
        const attendances = await this._attendanceService.getUserAttendances(
          this.user()!._id!
        );
        this.userAttendances.set(attendances.reverse());
        console.log('User attendances:', attendances);
      }
    });
  }
}
