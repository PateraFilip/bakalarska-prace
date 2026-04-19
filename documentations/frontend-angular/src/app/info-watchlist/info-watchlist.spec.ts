import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoWatchlist } from './info-watchlist';

describe('InfoWatchlist', () => {
  let component: InfoWatchlist;
  let fixture: ComponentFixture<InfoWatchlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoWatchlist]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoWatchlist);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
