import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaActivosPage } from './lista-activos.page';

describe('ListaActivosPage', () => {
  let component: ListaActivosPage;
  let fixture: ComponentFixture<ListaActivosPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ListaActivosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
