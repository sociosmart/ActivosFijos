import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PruebaimpresionPage } from './pruebaimpresion.page';

describe('PruebaimpresionPage', () => {
  let component: PruebaimpresionPage;
  let fixture: ComponentFixture<PruebaimpresionPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PruebaimpresionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
