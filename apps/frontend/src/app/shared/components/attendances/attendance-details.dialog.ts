import { Component, effect, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { Attendance, User } from '@etsecure/data-contracts';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-attendances-details-dialog',
  imports: [ButtonModule, CommonModule, DialogModule],
  template: `
    <p-dialog
      [(visible)]="this.isVisible"
      [style]="{ width: '450px' }"
      header="Attendance Details"
      [modal]="true"
      [closable]="true"
      [dismissableMask]="true"
      (onHide)="closeEvent.emit()"
    >
      <ng-template #content>
        <div class="flex flex-col gap-6">
          <div>
            <label for="name" class="block font-bold mb-3">
              {{ data()!.user.name }} entered room {{ data()!.room.name }} in
              building {{ data()!.room.location }} at
              {{ data()!.timestamp | date : 'medium' }}
            </label>
          </div>
          <div class="flex flex-row gap-2">
            <div class="flex-1">
              <h1 class="block font-bold ">User details:</h1>
              <div>
                <h4>ID:</h4>
                {{ data()!.user._id }} <br />
              </div>
              <div>
                <h2>Authentication ID:</h2>
                {{ data()!.user.authentik_id }} <br />
              </div>
              <div>
                <h2>Name:</h2>
                {{ data()!.user.name }} <br />
              </div>
              <div>
                <h2>Username:</h2>
                {{ data()!.user.username }} <br />
              </div>
              <div>
                <h2>Email:</h2>
                {{ data()!.user.email }} <br />
              </div>
              @if(data()!.user.groups) {
              <div>
                <h2>Groups:</h2>
                {{ data()!.user.groups }}
              </div>
              }
            </div>

            <div class="flex-1 text-right">
              <h1 class="block font-bold ">Room details:</h1>
              <div>
                <h2>ID:</h2>
                {{ data()!.room._id }} <br />
              </div>
              <div>
                <h2>Name:</h2>
                {{ data()!.room.name }} <br />
              </div>
              <div>
                <h2>Location:</h2>
                {{ data()!.room.location }} <br />
              </div>
            </div>
          </div>
        </div>
      </ng-template>
    </p-dialog>
  `,
})
export class AttendancesDetailsDialog {
  data = input<Attendance | null>();
  closeEvent = output<void>();

  public isVisible = false;

  constructor() {
    effect(() => {
      if (this.data()) {
        this.isVisible = true;
      } else {
        this.isVisible = false;
      }
    });
  }
}
