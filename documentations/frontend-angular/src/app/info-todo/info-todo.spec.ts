import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTodo } from './info-todo';

describe('InfoTodo', () => {
  let component: InfoTodo;
  let fixture: ComponentFixture<InfoTodo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTodo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoTodo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
