import { Component, Input, WritableSignal, signal, Injectable, inject, effect } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { computedAsync } from './index';
import { Observable, delay, of } from 'rxjs';

interface Product {
  id: number;
}

const backendDelay = 5000;
const initialValue = { id: -1 }
const id = 2;

const promiseCall = (id: number) => new Promise<Product>((resolve) => setTimeout(() => resolve({ id }), backendDelay));
const observableCall = (id: number) => of({ id }).pipe(delay(backendDelay));

@Injectable({
  providedIn: 'root'
})
class ProductService {
  getProduct(
    productId: number
  ): Product | Promise<Product> | Observable<Product> {
    return promiseCall(productId);
  }
}

@Component({
  selector: 'app-test',
  standalone: true,
  template: ``
})
export class TestComponent {
  private _productId: WritableSignal<number | null> = signal(null);

  private readonly productService = inject(ProductService);

  @Input({required: true})
  set productId(value: number | null) {
    this._productId.set(value);
  }
  get productId() {
    return this._productId();
  }

  notifier = signal(false);

  product = computedAsync(() => 
  this.productId && this.productService.getProduct(this.productId), 
  { initialValue, evaluating: this.notifier });
}

describe('computeAsync', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let productService: ProductService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    component.productId = 1;
    productService = TestBed.inject(ProductService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have product computed from observable async', fakeAsync(() => {
    const expected: Product = { id };
    spyOn(productService, 'getProduct').and.callFake(observableCall);
    component.productId = id;
    fixture.detectChanges();
    tick(backendDelay);
    expect(component.product()).toEqual(expected);
  }));

  it('should have product computed from promise async', fakeAsync(() => {
    const expected: Product = { id };
    spyOn(productService, 'getProduct').and.callFake(promiseCall);
    component.productId = id;
    fixture.detectChanges();
    tick(backendDelay);
    expect(component.product()).toEqual(expected);
  }));

  it('should have product computed from sync', () => {
    const expected: Product = { id };
    spyOn(productService, 'getProduct').and.callFake((id) =>  ({ id }));
    component.productId = id;
    fixture.detectChanges();
    expect(component.product()).toEqual(expected);
  });

  it('should have product computed with initial value from async', fakeAsync(() => {
    expect(component.product()).toEqual(initialValue);
  })); 
  
  it('should have notifier emitting value when async complete', fakeAsync(() => {
    spyOn(productService, 'getProduct').and.callFake(promiseCall);
    expect(component.notifier()).toEqual(false);
    component.productId = id;
    fixture.detectChanges();
    tick(backendDelay / 2);
    expect(component.notifier()).toEqual(false);
    tick(backendDelay / 2);
    expect(component.notifier()).toEqual(true);
  }));
});
