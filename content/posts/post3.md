---

title: js 手写题
date: 2022-05-28
---​

之前在准备面试时，肝了很多 js 的手写题。我对 js 这些手写题的看法就是，在学习初期，能真正搞懂并且实现，能很大程度提升自己对 js 的理解和使用。话不多说，一起来看看一些常见的 js 手写题，以及我的实现吧！

### 一、数据类型判断

**要求：**写一个函数，给定任意的 js 的变量，准确判断其类型。

**思路：**在 js 当中，针对简单数据直接使用 typeof 关键字就可以获取对应的类型，而引用类型，返回值都是 object，所以不准确。我们可以通过 Object.prototype.toString 方法来准确获取其类型

**实现：**

```javascript
function myTypeOf(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

myTypeOf(2); // Number
myTypeOf([]); // Array
myTypeOf({}); // Object
myTypeOf(new Date()); // Date
myTypeOf(/reg/); // RegExp
```

### 二、数组的操作

#### 1、数组去重

**思路：**有两种思路来实现，一个是利用数组的迭代方法，另一种则是直接使用 es6 新增的 set

**实现：**

```javascript
function deduplication(arr) {
  // indexOf返回的是首次出现的索引
  return arr.filter((item, index, array) => array.indexOf(item) === index);
}

function deduplicationBySet(arr) {
  return [...new Set(arr)];
}
```

#### 2、数组扁平化

**要求：**将多维数组拍平，变为一维数组

**思路：**同样有两种思路，可以使用递归，也可以使用数组的迭代方法

**实现：**

```javascript
const flatten = (arr) => {
  let result = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    if (Array.isArray(arr[i])) {
      result = [...result, ...flatten(arr[i])];
    } else {
      result = [...result, arr[i]];
    }
  }
  return result;
};

const flattenBySome = (arr) => {
  // some方法是有一项满足要求，则是true
  while (arr.some((item) => Array.isArray(item))) {
    // 数组的concat方法，当参数为数组时，会将数组的每一项添加到结果数组
    arr = [].concat(...arr);
  }
  return arr;
};
```

### 三、函数相关的方法

#### 1、函数原型的三个方法：bind，call，apply

**要求：**使用的时候，要像 fun.myBind()这样调用，并且参数、最终效果和对应的方法保持一致

**思路：**1、要在函数原型实现，直接在 Function.Prototype 上定义即可。2、关键点在于怎么改变 this 的指向呢？我们知道，在 js 中，一个 obj 对象的方法 f，**通过 obj.f()来调用时，f 中的 this 是指向 obj 的**。我们就可以通过这点来实现 this 指向的改变。

**实现：**

```javascript
Function.prototype.myCall = function (context = globalThis, ...args) {
  const fnKey = Symbol(); // 防止context中有同名的键
  context[fnKey] = this; // this就是调用myCall的函数
  const res = context[fnKey](...args); // 调用函数，改变this指向
  delete context[fnKey]; // 将fn删除，防止污染context
  return res;
};

// apply的区别就是传参为数组
Function.prototype.myApply = function (context = globalThis, args = []) {
  const fnKey = Symbol(); // 防止context中有同名的键

  context[fnKey] = this; // this就是调用myCall的函数

  const res = context[fnKey](...args); // 调用函数，改变this指向
  delete context[fnKey]; // 将fn删除，防止污染context
  return res;
};

// bind就可以直接使用我们上面实现的apply了，不过需要注意bind使用时可以传参数，并且返回的函数还可以传参
Function.prototype.myBind = function (context = globalThis, ...bindArgs) {
  const self = this;
  return function (...args) {
    const resultArgs = bindArgs.concat(args);
    return self.myApply(context, resultArgs);
  };
};
```

#### 2、函数防抖和函数节流

要求：函数防抖和节流支持传参

思路：首先要知道防抖和节流的效果。防抖是：触发高频事件 N 秒后只会执行一次，如果 N 秒内事件再次触发，则会重新计时；而节流是 N 秒内只执行一次。

实现：

```javascript
function debounce(fn, delay) {
  let timeout;
  return function (...args) {
    const context = this;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

// 定时器版本节流
function throttleByTimer(fn, delay) {
  let timer;
  return function (...args) {
    const context = this;
    if (timer) {
      return;
    }
    timer = setTimeout(function () {
      fn.apply(context, args);
      timer = null; // 在delay后执行完fn之后必须清空定时器，保证下次throttle触发可以进入计时器
    }, delay);
  };
}

// 时间戳版本节流
function throttleByDate(fn, delay) {
  let previous = 0;
  return function (...args) {
    const context = this;
    const now = new Date();
    if (now - previous > delay) {
      fn.apply(context, args);
      previous = now;
    }
  };
}
```

### 四、深拷贝

要求：手写深拷贝，

思路：对嵌套的引用使用递归进行拷贝

实现：

```javascript
// 简单版，不考虑其他内置类型和函数类型
function deepClone(obj) {
  if (typeof obj !== 'object') return obj; // 不是引用类型，则返回原始值，并且作为递归的出口

  if(typeof obj === 'object'&& !obj) return null; // 考虑null

  const newObj = Array.isArray(obj) ? [] : {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 这里使用hasOwnProperty防止对象原型上的属性被遍历出来
      newObj[key] = deepClone(obj[key]);
    }
  }

  return newObj;
}

// 强化版，增加内置类型，和循环引用
function strongerDeepClone(obj, map = new WeakMap()) {
  if (typeof obj !== 'object') return obj;
  if (typeof obj === 'object' && !obj) return null;

 + if (map.get(obj)) {
 +  // 解决循环引用
 +   return obj;
 + }

 + let constructor = obj.constructor;
 + // 检测当前对象target是否与正则、日期格式对象匹配
 + if (/^(RegExp|Date)$/i.test(constructor.name)) {
 +   // 创建一个新的特殊对象(正则类/日期类)的实例
 +   return new constructor(obj);
 + }

 + map.set(obj, true); // 为循环引用的对象做标记

  const newObj = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      // 这里使用hasOwnProperty防止对象原型上的属性被遍历出来
      newObj[key] = deepClone(obj[key], map);
    }
  }

  return newObj;
}
```

### 五、总结

常见的一些手写主要就是针对数组与函数的一些现有 api，手写的意义除了应付面试，更多的是提升自己对 js 的语法基础以及相应概念的理解。
