---
title: Typescript 的其他高级用法
date: 2022-04-28
---

在日常 ts 的使用中，除了泛型之外，还有很多非常实用的高级用法，本文就这些方法做一些简单的总结。

### 一、运算符

#### 1、非空运算符（!.）

**作用：**告诉 ts，某个变量和函数一定是非空的(非 null/undefined)。

**使用场景：**有时候我们会在复用场景下，针对某个变量在类型声明时会加上可能为空的情况，但是在某个组件使用/调用时，这个变量一定不是空，我们不需要做一个 if 判断，直接使用!.来告诉 ts，该变量一定不会空。

**例子：**使用 ref，获取页面中的一个 input 标签元素对应的 dom，当组件渲染完毕时，让其聚焦。正常情况下此时在 useEffect 中，ts 提示错误，因为 inputRef 可能为 null（事实也确实如此，因为在 input 未渲染时，useRef 是需要一个初始值的），但是我们知道 useEffect 是在组件 mount 之后出发的，所以此时，inputRef.current 是必定有的，所以我们可以使用!.运算符手动告诉 ts，该变量为非空。

```typescript
function TestDemo() {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current!.focus();
  }, []);
  return <input ref={divRef} type="text" />;
}
```

#### 2、可选链运算符( ?.)

该操作符与 js 的使用方式一致，允许读取位于连接对象链深处的属性的值，而不必明确验证链中的每个引用是否有效，在引用为空([`null`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/null) 或者 [`undefined`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/undefined)) 的情况下不会引起错误，该表达式短路返回值是 `undefined`。与函数调用一起使用时，如果给定的函数不存在，则返回 `undefined`。

### 二、操作符

#### 1、keyof 操作符

**作用：**keyof 可以获取一个类型所有键值，返回一个联合类型

**使用场景：**当需要获取某个接口所有键的类型的时候，比如用于泛型约束等

**例子：**获取某个对象的值，除了使用之前提到的泛型来做，我们还可以使用 keyof 操作符，这样就避免说 key 写 string/any 这些没有限制的类型。

```typescript
function getValue(p: Person, k: keyof Person) {
  return p[k];
}
```

#### 2、typeof 操作符

**作用：**获取后面跟的实例/对象的类型

**使用场景：**当我们使用一些第三方库时，不知道返回的对应的变量类型是啥，但有些地方又需要做相关的类型声明时，可以考虑使用

**例子：**

```typescript
const person = { name: 'jokery', age: 25 };
type P = typeof person; // { name: string, age: number }
```

#### 3、索引访问操作符

**作用：**类似于 `js` 中使用对象索引的方式，只不过 `js` 中是返回对象属性的值，而在 `ts` 中返回的是 `T` 对应属性 P 的类型

**使用场景：**当我们需要使用对象某个值的类型时，不需要重新声明，只需要通过索引访问即可

**例子：**

```typescript
export interface DistributionAnalysisParams extends BasicParam {
  events: {
  	eventType: EventType;
  	relation: RelationType;
  	filters: Filters[]; // 筛选条件
		...
  };
}

// other ts files
interface Props {
  events: DistributionAnalysisParams['events'];
}
```

### 三、常用的泛型工具

#### 1、Partial

**作用：**将泛型中全部属性变为可选的。

**例子：**

```typescript
interface Person {
  name: string;
  age: number;
}

let person: Person = {}; // 此处会提示错误，因为{}中没有name和age属性。

// 使用 Partial工具，返回的新类型，name 和 age 都变成了可选属性
let anotherPerson: Partial<Person> = {};
```

#### 2、Required

**作用：**和 `Partial` 的作用相反，用于将 `T` 类型的所有属性设置为必选状态。

**例子：**

```typescript
interface Person {
  name?: string;
  age?: number;
}

// 使用 Required 映射后返回的新类型，name 和 age 都变成了必选属性
let person: Required<Person> = {};
```

#### 3、Pick

**作用：**将 对象中的某些键值对提取提取出来，生成新的子键值对类型。

**例子：**我们定义了一个比较复杂的类型，但是在某些场合，需要做新的类型声明，但是键值对在之前的接口中都做了声明，此时没必要重复声明

```typescript
interface EventInfo {
  describe: string;
  id: number;
  name: string;
  status: number;
  type: number;
}

type BasicEvent = Pick<EventInfo, 'name' | 'id'>; // { name: string; id: number; }
```

#### 4、Omit

**作用：**与 Pick 正好想法，排除一些键值对

**例子：**

```typescript
interface EventInfo {
  describe: string;
  id: number;
  name: string;
  status: number;
  type: number;
}

type BasicEvent = Omit<EventInfo, 'name' | 'id'>; // { describe:string; status:number; type:number }
```

#### 5、ReturnType

**作用：**返回一个函数的返回类型，当我们不知道一个函数的返回类型时（主要是第三方库）可以考虑用该工具

**例子：**

```typescript
let timeout = ReturnType<typeof setTimeout> | null   // 用于声明一个定时器类型
```

### 四、总结

本文总结了一些在 ts 的日常开发中，使用频率比较高的一些高级用法，主要包括运算符、操作符和一些泛型工具，熟练使用可以显著减少 ts 的一些类型声明代码量，早点下班！
