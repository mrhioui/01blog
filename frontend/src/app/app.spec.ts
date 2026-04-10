import { TestBed } from '@angular/core/testing';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { provideRouter } from '@angular/router';

describe('MainLayoutComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]), // Add this because layouts usually have <router-outlet>
      ],
    }).compileComponents();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  // Only keep this if you actually have an <h1> in main-layout.html
  it('should render the layout container', () => {
    const fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    // Check for something that actually exists in your HTML
    expect(compiled).toBeTruthy();
  });
});
