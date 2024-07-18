import {ComponentFixture, TestBed} from '@angular/core/testing';
import {RtdeCommunicatorComponent} from "./rtde-communicator.component";
import {TranslateLoader, TranslateModule} from "@ngx-translate/core";
import {Observable, of} from "rxjs";

describe('RtdeCommunicatorComponent', () => {
  let fixture: ComponentFixture<RtdeCommunicatorComponent>;
  let component: RtdeCommunicatorComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RtdeCommunicatorComponent],
      imports: [TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader, useValue: {
            getTranslation(): Observable<Record<string, string>> {
              return of({});
            }
          }
        }
      })],
    }).compileComponents();

    fixture = TestBed.createComponent(RtdeCommunicatorComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
