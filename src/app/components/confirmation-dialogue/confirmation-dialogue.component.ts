import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialogue',
  templateUrl: './confirmation-dialogue.component.html',
  styleUrls: ['./confirmation-dialogue.component.scss']
})
export class ConfirmationDialogueComponent implements OnInit {
message;
successButton;
cancelButton;
  constructor(private matDialogueRef: MatDialogRef<ConfirmationDialogueComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { 
    this.message = data.message;
    this.successButton = data.successButton;
    this.cancelButton = data.cancelButton;
  }

  ngOnInit(): void {
  }

  success() {
    this.matDialogueRef.close('yes');
  }

  cancel() {
    this.matDialogueRef.close('No');
  }
}
