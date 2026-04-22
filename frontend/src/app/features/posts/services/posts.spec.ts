import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Posts } from './posts';

describe('Posts', () => {
  let service: Posts;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Posts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
