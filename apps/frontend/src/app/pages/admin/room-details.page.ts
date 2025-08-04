import { Component, effect, inject, model } from '@angular/core';
import { AttendanceService } from '../../shared/services/attendences.service';
import { Attendance, Room } from '@etsecure/data-contracts';
import { ActivatedRoute } from '@angular/router';
import { TimelineModule } from 'primeng/timeline';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { RoomsService } from '../../shared/services/rooms.service';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-room-details',
  imports: [
    TimelineModule,
    CommonModule,
    CardModule,
    TagModule,
    TooltipModule,
    ChipModule,
  ],
  template: `
    <p-card>
      <h1>Room Details</h1>
      @if (this.room()) {
        <div class="flex flex-wrap gap-6">
          <div class="flex flex-col grow basis-0 gap-2">
            <strong>ID:</strong> {{ this.room()!._id }}
          </div>
          <div class="flex flex-col grow basis-0 gap-2">
            <strong>Name:</strong> {{ this.room()!.name }}
          </div>
          <div class="flex flex-col grow basis-0 gap-2">
            <strong>Location:</strong> {{ this.room()!.location }}
          </div>
        </div>
        @if (this.roomAttendances() && this.roomAttendances()!.length > 0) {
          <section>
            <h1>Attendances</h1>
            <div>
              <p-timeline [value]="roomAttendances()">
                <ng-template #opposite let-event>
                  <small class="text-surface-500 dark:text-surface-400">
                    {{ event.timestamp | date: 'medium' }}
                  </small>
                </ng-template>
                <ng-template #content let-event>
                  {{ event.user.name }}
                </ng-template>
                <ng-template #marker let-event>
                  @if (event.type === 'bypass') {
                    <span
                      pTooltip="Bypass"
                      tooltipPosition="top"
                      class="flex w-8 h-8 items-center justify-center p-tag-error rounded-full z-10 shadow-sm"
                      [style]="{
                        background: 'var(--p-tag-danger-background)',
                        color: 'var(--p-tag-danger-color)',
                      }"
                    >
                      <i [class]="'pi pi-exclamation-triangle'"></i>
                    </span>
                  } @else {
                    <span
                      pTooltip="Unlock"
                      tooltipPosition="top"
                      class="flex w-8 h-8 items-center justify-center p-tag-info rounded-full z-10 shadow-sm"
                      [style]="{
                        background: 'var(--p-tag-info-background)',
                        color: 'var(--p-tag-info-color)',
                      }"
                    >
                      <i [class]="'pi pi-lock-open'"></i>
                    </span>
                  }
                </ng-template>
              </p-timeline>
            </div>
          </section>
        }
      }
    </p-card>
  `,
})
export class RoomDetailsPage {
  public roomAttendances = model<Attendance[]>();

  public room = model<Room | null>(null);

  private _activatedRoute = inject(ActivatedRoute);
  private _attendanceService = inject(AttendanceService);
  private _roomsService = inject(RoomsService);

  constructor() {
    effect(async () => {
      this.room.set(
        await this._roomsService.getRoom(
          this._activatedRoute.snapshot.params['id'],
        ),
      );

      if (this.room()) {
        const attendances = await this._attendanceService.getRoomAttendances(
          this.room()!._id!,
        );
        this.roomAttendances.set(attendances.reverse());
        console.log('Room attendances:', attendances);
      }
    });
  }
}
