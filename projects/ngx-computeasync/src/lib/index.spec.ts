import { Component, Input, WritableSignal, signal, Injectable, inject, effect } from '@angular/core';
import { ComponentFixture, TestBed, discardPeriodicTasks, fakeAsync, flush, tick } from '@angular/core/testing';
import { computedAsync } from './index';
import { BehaviorSubject, Observable, delay, map, of, timer } from 'rxjs';

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

@Component({
  selector: 'app-test-with-long-life-observable',
  standalone: true,
  template: ``
})
export class TestComponentWithLongLifeObservable {
  a: WritableSignal<number> = signal(0);
  
  obs$ = (a: number) => timer(0, 10).pipe(map(b => a + b));
  sum = computedAsync(() => 
     this.obs$(this.a())
  );
}

describe('computeAsync with long life Observables', () => {
  let component: TestComponentWithLongLifeObservable;
  let fixture: ComponentFixture<TestComponentWithLongLifeObservable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponentWithLongLifeObservable]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TestComponentWithLongLifeObservable);
    component = fixture.componentInstance;
  });

  it('should have sum computed with rxjs timer value and signal', fakeAsync(() => {
    fixture.detectChanges();
    tick(0);
    expect(component.sum()).toEqual(0); // a = 0, b = 0
    
    tick(10);
    expect(component.sum()).toEqual(1); // a = 0, b = 1
    
    tick(10);
    expect(component.sum()).toEqual(2); // a = 0, b = 2
    
    component.a.update(a => a + 1);
    fixture.detectChanges();
    tick(0);
    expect(component.sum()).toEqual(1); // a = 1, b = 0
    
    tick(10);
    expect(component.sum()).toEqual(2); // a = 1, b = 1
    
    component.a.set(7);
    fixture.detectChanges();
    tick(10);
    expect(component.sum()).toEqual(8); // a = 7, b = 1

    discardPeriodicTasks()
  })); 
})