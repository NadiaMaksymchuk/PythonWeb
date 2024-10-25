import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from '../../app.routes';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  SecurityEventCreate,
  SecurityEventDto,
  SecurityEventType,
  SecurityEventUpdate,
} from '../../models/security-event.model';
import { RouterModule } from '@angular/router';
import { SecurityEventService } from '../../services/security-event.service';
import { StoredItemService } from '../../services/stored-item.service';
import { StoredItemDto } from '../../models/stored-item.model';
import { forkJoin, Observable } from 'rxjs';

interface SecurityEventWithStoredItem extends SecurityEventDto {
  storedItemName?: string;
  storedItemClassification?: string;
}

@Component({
  selector: 'app-home-user',
  standalone: true,
  imports: [NgIf, NgFor, CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './home-user.component.html',
  styleUrl: './home-user.component.css',
})
export class HomeUserComponent {
  securityEvents: SecurityEventDto[] = [];
  selectedEvent: SecurityEventDto | null = null;
  securityEventForm: FormGroup;
  isEditMode: boolean = false;
  error: string = '';
  securityEventTypes = Object.values(SecurityEventType);

  showSuccessToast: boolean = false;
  toastMessage: string = '';
  toastBgColor: string = 'bg-success';
  userEmail: string | null = null;
  errorMessage: string | null = null;
  storedItemsList: StoredItemDto[] = [];
  private storedItemCache = new Map<string, Observable<StoredItemDto>>();

  constructor(
    private securityEventService: SecurityEventService,
    private fb: FormBuilder,
    private authService: AuthService,
    private storedItemService: StoredItemService
  ) {
    this.securityEventForm = this.fb.group({
      event_type: ['', Validators.required],
      description: [''],
      stored_item_id: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.authService.customerAuth().subscribe({
      next: (email: string) => {
        this.userEmail = email;
        this.errorMessage = null;
      },
      error: (err) => {
        this.errorMessage =
          'Unauthorized or session expired. Please log in again.';
        this.userEmail = null;
        console.error(err);
      },
    });

    this.loadSecurityEvents();
    this.loadStoredItems();
  }

  loadStoredItems(): void {
    this.storedItemService.getAllStoredItems().subscribe({
      next: (data) => {
        this.storedItemsList = data;
        this.loadSecurityEvents();
      },
      error: (err) => {
        this.error = 'Failed to load stored items.';
        console.error(err);
      },
    });
  }

  // Load all security events and their corresponding stored item details
  loadSecurityEvents(): void {
    this.securityEventService.getSecurityEvents().subscribe({
      next: (data) => {
        this.securityEvents = data;
        this.fetchStoredItemsForEvents();
      },
      error: (err) => {
        this.error = err;
      },
    });
  }

  // Fetch StoredItem details for each SecurityEvent
  fetchStoredItemsForEvents(): void {
    const uniqueStoredItemIds = Array.from(
      new Set(this.securityEvents.map((event) => event.stored_item_id))
    );

    const storedItemObservables = uniqueStoredItemIds.map((id) =>
      this.storedItemService.getStoredItemById(id!)
    );

    forkJoin(storedItemObservables).subscribe({
      next: (storedItems: StoredItemDto[]) => {
        const storedItemMap = new Map<string, StoredItemDto>();
        storedItems.forEach((item) => storedItemMap.set(item.id, item));

        this.securityEvents.forEach((event) => {
          const storedItem = storedItemMap.get(event.stored_item_id!);
          if (storedItem) {
            event.storedItemName = storedItem.name;
            event.storedItemClassification = storedItem.classification;
          } else {
            event.storedItemName = 'Unknown';
            event.storedItemClassification = 'Unknown';
          }
        });
      },
      error: (err) => {
        this.error = 'Failed to load stored item details.';
        console.error(err);
      },
    });
  }

  // Handle form submission for create/update
  onSubmit(): void {
    if (this.securityEventForm.invalid) {
      return;
    }

    const formValue = this.securityEventForm.value;

    if (this.isEditMode && this.selectedEvent) {
      const updateData: SecurityEventUpdate = {
        event_type: formValue.event_type,
        description: formValue.description,
        stored_item_id: formValue.stored_item_id,
      };

      this.securityEventService
        .updateSecurityEvent(this.selectedEvent.id, updateData)
        .subscribe({
          next: (updatedEvent) => {
            // Update the event in the list
            const index = this.securityEvents.findIndex(
              (event) => event.id === updatedEvent.id
            );
            if (index !== -1) {
              // Find the corresponding stored item
              const storedItem = this.storedItemsList.find(
                (item) => item.id === updatedEvent.stored_item_id
              );
              this.securityEvents[index] = {
                ...updatedEvent,
                storedItemName: storedItem ? storedItem.name : 'Unknown',
                storedItemClassification: storedItem
                  ? storedItem.classification
                  : 'Unknown',
              };
            }
            this.showToast('Security event updated successfully!');
            this.resetForm();
          },
          error: (err) => {
            this.error = err;
          },
        });
    } else {
      const createData: SecurityEventCreate = {
        event_type: formValue.event_type,
        description: formValue.description,
        stored_item_id: formValue.stored_item_id,
      };

      this.securityEventService.createSecurityEvent(createData).subscribe({
        next: (newEvent) => {
          // Find the corresponding stored item from the list
          const storedItem = this.storedItemsList.find(
            (item) => item.id === newEvent.stored_item_id
          );
          const eventWithStoredItem: SecurityEventWithStoredItem = {
            ...newEvent,
            storedItemName: storedItem ? storedItem.name : 'Unknown',
            storedItemClassification: storedItem
              ? storedItem.classification
              : 'Unknown',
          };
          this.securityEvents.push(eventWithStoredItem);
          this.showToast('Security event created successfully!');
          this.resetForm();
        },
        error: (err) => {
          this.error = err;
        },
      });
    }
  }

  // Edit an existing event
  editSecurityEvent(event: SecurityEventWithStoredItem): void {
    this.isEditMode = true;
    this.selectedEvent = event;
    this.securityEventForm.patchValue({
      event_type: event.event_type,
      description: event.description,
      stored_item_id: event.stored_item_id,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Delete an event
  deleteSecurityEvent(event: SecurityEventWithStoredItem): void {
    if (confirm(`Are you sure you want to delete this security event?`)) {
      this.securityEventService.deleteSecurityEvent(event.id).subscribe({
        next: (deletedEvent) => {
          this.securityEvents = this.securityEvents.filter(
            (e) => e.id !== deletedEvent.id
          );
          this.showToast('Security event deleted successfully!', 'bg-danger');
        },
        error: (err) => {
          this.error = err;
        },
      });
    }
  }

  // Reset the form to initial state
  resetForm(): void {
    this.isEditMode = false;
    this.selectedEvent = null;
    this.securityEventForm.reset({
      event_type: '',
      description: '',
      stored_item_id: '',
    });
    this.error = '';
  }

  // Show toast notifications
  showToast(message: string, bgColor: string = 'bg-success'): void {
    this.toastMessage = message;
    this.toastBgColor = bgColor;
    this.showSuccessToast = true;

    // Auto-hide the toast after 3 seconds
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }

  // Helper method to get stored items list for the dropdown
  getStoredItemsList(): StoredItemDto[] {
    return this.storedItemsList;
  }
}
