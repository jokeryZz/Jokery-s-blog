---

title: ES7~ES12 常见的开发技巧
date: 2022-06-30
---​

### 概述

自从 ECMAScript 在 2015 年正式发布了 ES6 起，到现在已经快 8 个年头了，而自从 2015 年起，每年的 6 月都会发布一个新的版本，以当时的年作为版本号。在现在的前端开发中，相信大家都对 ES5、ES6 的语法都烂熟于心呢，不熟的，出门右拐找一下阮一峰老师的《ES6 入门教程》。针对 ES6 之后的常用的新特性，各位了解多少呢？不妨一起来看看，在日常工作中是否有使用到。

#### ES7

**1、指数运算符**

​ a \*\* b 指数运算符，它与 Math.pow(a, b)相同。

**2、Array.prototype.includes()**

该方法函数用来判断一个数组是否包含一个指定的值，如果包含则返回 `true`，否则返回`false`。跟 indexOf 方法很像，就是要注意两者的返回。特别注意，如果要找 NaN，用 indexOf 是找不到的。

```javascript
const arr = [1, 2, NaN];

console.log(arr.indexOf(NaN)); // -1  indexOf找不到NaN
console.log(arr.includes(NaN)); // true includes能找到NaN
```

#### ES8

**1、对象扩展**

es8 提供了对象的两个静态方法，用于对象的遍历，分别是 Object.values()返回给定对象自身所有属性的值，不包括继承的值。Object.entries()返回一个给定对象自身可枚举属性的键值对的数组。

```javascript
const obj = { a: 1, b: 2, c: 3 };

const values = Object.values(obj1);
console.log(values); //[1, 2, 3]

for (let [key, value] of Object.entries(obj1)) {
  console.log(`key: ${key} value:${value}`);
}
//key:a value:1
//key:b value:2
//key:c value:3
```

**2、async/await**

这个语法糖就不多介绍了，简单讲就是用同步的方式去执行异步操作，大大简化了异步编程的代码。

**3、字符串扩展**

ES8 新增了字符串的两个方法，可以在字符串的头部或尾部添加需要的字符串，比方说有时候想要补 0 啊，补其他字符的时候可以考虑使用。

**String.padStart(targetLength,[padString])/String.padEnd(targetLength,padString])**

targetLength:当前字符串需要填充到的目标长度。如果这个数值小于当前字符串的长度，则返回当前字符串本身。

padString:(可选)填充字符串。如果字符串太长，使填充后的字符串长度超过了目标长度，则只保留最左侧的部分，其他部分会被截断，默认为空格。

#### ES9

**1、异步迭代 for...await...of**

使用场景：如果有多个异步函数，想要让他们依次执行，一个简单的实现就是，按顺序 await。那如果函数太多了，就会写很多个 await，如果我们直接把函数放在数组中，用 for 来遍历呢？结果是不行的，因为循环的代码是同步的，无法达到效果。那 ES9 提供了一个异步迭代的方法。

```javascript
async function process(array) {
  for await (let i of array) {
    doSomething(i); // 这样就能保证数组中的异步代码是按照顺序来执行的了
  }
}
```

2、Promise.finally()

使用场景：很多时候我们会针对一些异步操作的结束做一些收尾工作，就可以使用该方法。

```javascript
new Promise((resolve, reject) => {
  resolve('成功');
})
  .then(
    (res) => {
      console.log(res);
    },
    (err) => {
      console.log(err);
    }
  )
  .finally(() => {
    console.log('Finally');
  });
```

#### ES10

**1、Array.prototype.flat()**

用于打平数组，可以传入降维参数，如果传入 Infinite，则可以直接多维数组直接打平至一维数组。并且该方法可以去除数组中的空值

```javascript
const arr = [1, 2, 3, [4, 5, 6, [7, 8, 9]]];

console.log(arr.flat(2))[(1, 2, 3, 4, 5, 6, 7, 8, 9)];
const arr = [1, 2, 3, [4, 5, 6, [7, 8, 9, [10, 11, 12]]]];

console.log(arr.flat(Infinity))[(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)];

const arr = [1, 2, , 4, 5];
arr.flat();
// [1, 2, 4, 5]
```

**2、Array.prototype.flatMap()**

该方法就是 flat 和 map 的融合版，简化操作

```javascript
const arr = ['1 2 3', '4 5 6'];

console.log(arr.map((x) => x.split(' ')).flat()); // [1,2,3,4,5,6]

console.log(arr.flatMap((x) => x.split(' '))); // [1,2,3,4,5,6]
```

**3、Object.fromEntries()**

ES8 的 Object.entries 是把对象转成键值对数组，而 Object.fromEntries 则相反，是把键值对数组转为对象。最常用的是将 Map 转为对象

```javascript
const map = new Map();
map.set('name', 'jokery');
map.set('age', 25);
map.set('gender', '男');

console.log(map); // Map(3) { 'name' => 'jokery', 'age' => 25, 'gender' => '男' }

const obj = Object.fromEntries(map);
console.log(obj); // { name: 'jokery', age: 25, gender: '男' }
```

**4、字符串的 trimStart()和 trimEnd()**

看命名即可知道功能，去除首尾的空格

#### ES11

**1、动态导入 import()**

可以实现我们在需要的时候再导入模块，返回一个 promise，这个也是 react/vue 一个动态加载组件的一个实现思路。

```javascript
import('/modules/my-module.js').then((module) => {
  // Do something with the module.
});
```

**2、全局对象 GlobalThis**

我们知道，全局对象，在 node 下是 Global，在浏览器是 window，为了避免我们混淆，可以直接使用 GlobalThis。

**3、Promise.allSettled**

- 接收一个 Promise 数组，数组中如有非 Promise 项，则此项当做成功
- 把每一个 Promise 的结果，集合成数组，返回

这个方法主要是用于我们对 Promise 数组的结果收集，之前 all 是必须所有的 Promise 都成功。两者使用上有一些差异。

**4、空值合并运算符??**

常用的是使用||短路，即 a||b，当 a 为假值时，返回 b。??和||使用差不多，唯一区别是，??只会将 undefined 和 null 视为假值

```javascript
const a = 0 ?? 'jokery'; // 0
const b = '' ?? 'jokery'; // ''
const c = false ?? 'jokery'; // false
const d = undefined ?? 'jokery'; // jokery
const e = null ?? 'jokery'; // jokery
```

**5、可选链操作符?.**

可选链操作符用于读取某对象链下深处属性的值，使用这个操作符不必验证对象下的每个属性必须存在，例如我们想要访问`A.a.b`这个属性时，我们首先需要确保`A`存在，然后需要确保`A.a`存在，才可以访问`A.a.b`这个属性，不然就会报错。

使用可选链操作符就不会出现这样的问题，当我们访问某个属性时，只要有一处不存在，就会返回`undefind`，不会报错。

```javascript
var A = {};

// console.log(A.a.b) // 报错

console.log(A.a?.b); // undefined
```

#### ES12

**1、Promise.any()**

- 接收一个 Promise 数组，数组中如有非 Promise 项，则此项当做成功
- 如果有一个 Promise 成功，则返回这个成功结果
- 如果所有 Promise 都失败，则报错

**2、String.replaceAll()**

替换字符串中所有的传入的字符串参数
