import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoGame } from './info-game';

describe('InfoGame', () => {
  let component: InfoGame;
  let fixture: ComponentFixture<InfoGame>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoGame]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoGame);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
