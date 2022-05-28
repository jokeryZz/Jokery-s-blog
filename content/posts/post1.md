---
title: Typescript 高级用法之泛型（Generics）
date: 2022-04-28
---

### 一、泛型的基本使用

#### 1、什么时候会使用到泛型？

日常工作中使用到泛型的场合主要是为了减少重复性代码。在前端框架的“组件化”思想中，这点非常常见。应尽可能将可复用的代码进行抽离，减少重复。ts 提供了泛型，可以很大程度的减少重复的类型声明。

#### 2、基本使用

比方说，如果我们需要定义一个函数，这个函数非常简单，参数是什么类型，结果返回就是什么类型。

如果不使用泛型，我们可能会这样：

```typescript
function foo(a: any): any {
  return a;
}
```

首先，ts 中，如果不注明类型，肯定会提示错误。但是如果我们使用万能的 any，就会丢失信息，即返回的值与传入的值类型必须相同！此时，可能会有同学使用 ts 的重载。但是相应的代码量就比较多，秉持着用最简单的代码做最多的事的原则，我们可以使用泛型函数来解决这个问题。

```typescript
function foo<T>(a: T): T {
  return a;
}
```

此时 foo 函数即成为了泛型函数，捕获类型变量 T，我们预先并不知道 T 是什么类型，只有使用的时候传入才知道。但是参数就是该类型，并且函数的返回值也是该类型。即实现了我们的需求。

当我们定义好了泛型函数，需要调用时，有两种方法：

```typescript
cosnt output1 = foo<string>("myString");  // type of output1 will be 'string'
const output2 = identity("myString");  // type of output2 will be 'string'
```

第一种调用方式，即在调用时，显式地指定 T 的类型；第二种利用了 ts 的类型推断，即编译器会根据我们传入的参数类型，自动推断出 T 的类型为 string，在日常工作中，比较建议使用第二种。

### 二、常用的泛型场景

#### 1、泛型接口

在日常工作中，interface 的使用频率是非常高的，很多场景有些接口很多属性是相同的，我们完全可以使用泛型来简化代码。比方说：

```typescript
interface CommonResponse<T> {
  code: number;
  message: string;
  data: T;
}
```

在所有的接口请求中，均有 code 和 message 字段，仅 data 不一样，我们完全可以单独为 data 定义一个泛型，在各处使用是，具体定义 T。

#### 2、泛型约束

以最开始的 foo 函数为例，

```typescript
function foo<T>(arg: T): T {
  console.log(arg.length); // Error: T doesn't have .length
  return arg;
}
```

如果我们直接使用泛型，一定会报错，因为 T 类型并没有 length 这个属性，但是我们事先又并不知道 arg 会是啥类型，可能是 string，可能是数组，甚至可能是一个对象。但是他们都要求带有 length 属性，这个时候，我们就可以使用泛型约束，即对 T 做一些约束。

```typescript
interface Length {
  length: number;
}

function foo<T extends Length>(arg: T): T {
  console.log(arg.length); // Now arg has .length property
  return arg;
}
```

我们使用 extends 关键字，使 T 继承 Length 接口，从而保证 T 一定带有 length 属性。此时，foo 函数的参数就不再适用于任何类型了，即我们传入的参数类型受到了泛型约束的限制。

```typescript
foo(3); // Error, number doesn't have a .length property
foo({ length: 10, value: 3 }); // no more error
```

此外，我们还可以声明多个类型变量，其中某个类型变量收到其他类型变量的约束。比如，我们想要通过属性名去一个对象中获取对应的属性，但是又要保证该属性名是存在于该对象的。我们可以这么写：

```typescript
function getPropertyByKey(obj: T, key: K) {
  return obj[key];
}

let x = { a: 1, b: 2, c: 3, d: 4 };

getProperty(x, 'a'); // okay
getProperty(x, 'm'); // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.
```

#### 3、泛型组件

在最近的工作中，就碰到了使用泛型组件的场景。即返回组件的函数是一个泛型函数。场景抽象如下：在组件 A,B,C 中，都**用到了 D 组件**，其中**D 组件的 props 中有一个必传的参数 queryParam**，D 组件**只需要使用 queryParam 当中的 group 字段，其余的不在意**。但是 A，B，C 的**queryParam 又各不一样**。此时就可以考虑到泛型组件。

```typescript
interface BasicParam {
  eventsGroup: EventGroups;
}

interface Props<T> {
  selectedEvents: string[];
  queryParams: T;
  updateQueryParams: (params: T) => void;
}

export default function GlobalGroup<T extends BasicParam>(props: Props<T>) {
   const handleChange = (value: EventGroups['globalization']) => {
    updateQueryParams({ ...queryParams, eventsGroup: { ...eventsGroup, globalization: value } });
  };

 ...
}
```

其实与之前的泛型函数类似，针对 props 使用泛型，组件中使用类型变量 T，通过继承 BasicParam 保证 T 一定带有 eventsGroup 属性，而 GlobalGroup 组件中，只需要保证 queryParams 中有 eventsGroup 属性即可做后续的操作了。这样就实现了我们的需求。否则，我们就可能需要在 queryParams 中使用联合类型，即 queryParams:A|B|C，然后做类型判断，一大堆繁琐的代码就出现了，违背了组件化的思想。而我们使用时也非常的方便了。

```typescript
interface AnalysisParam extends BasicParam {
  eventsSelect: EventSelect[];
  eventsGroup: EventGroups;
}

<GlobalGroup
  selectedEvents={selectedEvents}
  queryParams={queryParams} // queryParams:AnalysisParam
  updateQueryParams={setQueryParams}
/>;
```

在使用时，我们可以利用 ts 的类型断言，不显式的指明 T 的类型。

以上，便是一个 React 组件常规的写法。它定义的入参 `Props` 的泛型约束。由此也看出泛型的优势，即大部分代码可复用的情况下，将参数变成泛型后，不同类型的入参可复用同一组件，不用为新类型新写一个组件。

### 三、总结

ts 的泛型还有很多高级用法，后续可以再写一个博客做泛型的高级用法整理。ts 用的非常流弊的高手，都是在玩类型。

从上面的例子中可以看到，泛型用的好确实可以极大减少代码量，提高代码维护性。但是如果用的太深入，也可能会团队成员一脸茫然。所以因此抽象层次一定要合理，不能为了抽象而抽象。
