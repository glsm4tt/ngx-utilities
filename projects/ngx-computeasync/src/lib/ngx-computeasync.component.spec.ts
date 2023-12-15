import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxComputeasyncComponent } from './ngx-computeasync.component';

describe('NgxComputeasyncComponent', () => {
  let component: NgxComputeasyncComponent;
  let fixture: ComponentFixture<NgxComputeasyncComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxComputeasyncComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NgxComputeasyncComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
