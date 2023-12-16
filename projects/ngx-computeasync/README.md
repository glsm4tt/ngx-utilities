# ngx-computeasync

## Documentation

Computed for async functions

### Usage

``` typescript
import { Component, inject, signal } from '@angular/core'
import { computedAsync } from '@appstrophe/ngx-computeasync'

@Component({
  selector: 'app-test',
  template: `<p>{{ product() }}</p>`
})
export class TestComponent {
  productService = inject(ProductService);
  productId = signal(1);

  product = computedAsync(() => this.productService.getAsyncProduct(this.productId()));
}
```

`computedAsync` allows you to get a computed `Signal` from async content.

The content can either return a `Promise`
and rxjs `Observable` or a synchronous value.

``` typescript
import { computedAsync } from '@appstrophe/ngx-computeasync'

numberSignal = signal(1);

// from Observable
function double$ = (value: number) => of(value).pipe(delay(500), map(value => value * 2));

computedFromObservable = computedAsync(() => double$(this.numberSignal()));

// from Promise
function asyncDouble = (value: number) => new Promise(resolve => setTimeout(() => value * 2, 500));

computedFromPromise = computedAsync(() => asyncDouble(this.numberSignal()));

// or synchronous
function double = (value: number) => value * 2;

computedNumber = computedAsync(() => double(this.numberSignal()));
```

#### Initial value

For async function, you can set a default value that will be immediately returned before the async value to be pushed.

``` typescript
import { computedAsync } from '@appstrophe/ngx-computeasync'

mockedProduct = new Product();

productId = signal(1);

function product$ = (productId: number) => this.http.get<Config>(`productUrl/${productId}`);

computedFromObservable = computedAsync(() => product$(this.productId()),
{ initialValue: mockedProduct });
```

#### Evaluation State

You will need to pass a `WritableSignal` or a `BehaviorSubject` to track if the async function is evaluating.

``` typescript
import { computedAsync } from '@appstrophe/ngx-computeasync'

evaluating = signal(false);

evaluatingEffect = effect(() => console.log(`Get product server call completed: ${this.evaluating()}`))

productId = signal(1);

function product$ = (productId: number) => this.http.get<Config>(`productUrl/${productId}`);

computedFromObservable = computedAsync(() => product$(this.productId()),
{ evaluating });
```

## Documentation for contributors

### Install dependencies

Run `npm install` to install every dependencies.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

