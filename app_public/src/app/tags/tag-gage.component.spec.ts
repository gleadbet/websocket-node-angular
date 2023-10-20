import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IDTag, ITag } from './tag';                   // Interface used for tage

import { TagDetailComponent } from './tag-gage.component';

describe('TagDetailComponent', () => {
  let component: TagDetailComponent;
  let fixture: ComponentFixture<TagDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TagDetailComponent]
    });
    fixture = TestBed.createComponent(TagDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
