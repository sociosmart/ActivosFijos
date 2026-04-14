import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScanBarcodePage } from './scan-barcode.page';

describe('ScanBarcodePage', () => {
  let component: ScanBarcodePage;
  let fixture: ComponentFixture<ScanBarcodePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ScanBarcodePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
