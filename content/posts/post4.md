---

title: 手写 Promise
date: 2022-05-29
---​

Promise 是 es6 提出的新特性，用于解决回调地狱的问题，在异步的场景中使用非常广泛，我们这次就手动实现一个简单的 Promise 类，从基本使用来一步步实现，构造我们自己的 Promise，从而进一步加深对 Promise 及相关 API 的理解。

### 一、开始

#### 1、Promise 的创建

（**1）Promise 的基本使用**

​ 我们先看以下的例子：

```javascript
let p1 = new Promise((resolve, reject) => {
  resolve('成功');
});

let p2 = new Promise((resolve, reject) => {
  reject('失败');
});

let p3 = new Promise((resolve, reject) => {
  resolve('成功');
  reject('失败');
});

let p4 = new Promise((resolve, reject) => {
  throw new Error('出错了');
});
```

**（2）几个概念**

（a）在创建 Promise 实例时，我们需要传入一个函数，这个函数接收两个参数，一般我们命名为 resolve 和 reject。

（b）并且传入的函数是**立即执行**的，即在 new Promise 时，传入的函数就会开始执行。

（c）**调用 resolve，将函数的返回结果传给 reslove**，我们后续就可以拿到对应的值。相应的，**调用 reject，将错误原因传给 reject**，我们同样可以在后续操作中拿到函数执行的错误原因。

（d）Promise 有三种状态，分别是 pending、resolved、rejected，表示等待、成功、失败三种。调用 reslove 会将 Promise 的状态变为 resolve，调用 reject 会将 Promise 的状态变为 reject，且这个**转变是不可逆转**的。如 p3，调用了 resolve 再调用 reject，其状态仍为 resolved 的状态。

（e）并且在传入的函数中，如果**出错了。相当于我们调用了 reject。**

那我们先按照这个思路，来实现上述的要求（用 typescript 来实现）。

```typescript
enum State {
  PENDING = 'pending',
  RESOLVE = 'resolved',
  REJECT = 'rejected',
}

// 传入的函数类型
type Executor = (
  resolve: (value?: unknown) => void,
  reject: (reason?: unknown) => void
) => void;

class MyPromise {
  private _result: unknown; // 私有变量，用于存放promise内函数的执行结果
  private _state: State; // 私有变量，记录当前promise的状态
  // 构造方法
  constructor(executor: Executor) {
    // 初始化内部私有变量
    this._result = null;
    this._state = State.PENDING;
    // 执行传进来的函数
    executor(this._resolve, this._reject);
  }

  private _resolve = (value?: unknown) => {
    // 如果执行resolve，状态变为fulfilled
    this._state = State.RESOLVE;
    // 终值为传进来的值
    this._result = value;
  };

  private _reject = (reason?: unknown) => {
    // 如果执行reject，状态变为rejected
    this._state = State.REJECT;
    // 终值为传进来的reason
    this._result = reason;
  };
}
```

上述能实现（a）（b）和（c），但是没有实现状态变化不可逆，我们需要对\_resolve 和 \_reject 做一下条件判断，防止再调用 resolve 后又调用 reject 可以改变状态。**只有状态是 pending 才能执行 \_resolve 和 \_reject**

```typescript
  private _resolve = (value?: unknown) =>
   + if (this._state !== State.PENDING) return;
    // 如果执行resolve，状态变为fulfilled
    this._state = State.RESOLVE;
    // 终值为传进来的值
    this._result = value;
  };

  private _reject = (reason?: unknown) => {
   + if (this._state !== State.PENDING) return;
    // 如果执行reject，状态变为rejected
    this._state = State.REJECT;
    // 终值为传进来的reason
    this._result = reason;
  };
```

最后我们再处理一下 throw 的情景，即在函数中如果执行出错，要默认调用 reject。这个也比较好实现，用 try...catch 包一下即可：

```typescript
  constructor(executor: Executor) {
    this._result = null;
    this._state = State.PENDING;
    // 执行传进来的函数
  +  try {
      executor(this._resolve, this._reject);
  +  } catch (err) {
  +    this._reject(err);
  +  }
  }
```

#### 2、Promise.then()

**（1）基本使用**

按照上面的实现，我们就可以创建了一个基本的 Promise，那我们在日常使用中，对 Promise 内部的函数执行结果，是要通过.then 去拿到的。所以我们需要为我们的类，添加一个方法，用于获取 executor 执行后的结果。

首先，我们要知道.then 的使用：

（a）then**接收两个参数**，一个成功的回调，一个失败的回调（可选）；

（b）promise 的状态为 resolved 的时，会调用成功回调，并且结果作为参数；为 reject 时，会调用失败的回调，并将失败原因作为参数；

（c） 如果 executor 内是一个异步函数，我们**会在异步函数执行完之后，才会触发 then 内的回调**

（d）支持**链式调用**，且下一次 then 执行，是受上一次 then 返回值的影响；

**（2）实现**

```typescript
then = (
  onResolve: (value?: unknown) => void,
  onReject?: (reason?: unknown) => void
) => {
  if (this._state === State.RESOLVE) {
    // 如果当前为成功状态，执行第一个回调
    onResolve(this._result);
  } else if (this._state === State.REJECT) {
    // 如果当前为失败状态，执行第二个回调，用&&确保传入了失败回调
    onReject && onReject(this._result);
  }
};
```

上述，我们就实现了（a）和（b）的要求，我们先来看一下，异步函数的情况。

由于我们并不知道什么时候异步函数会执行完，所以就需要将成功回调与失败回调缓存起来，等待异步执行之后，将其调用。那我们怎么判断异步执行结束了呢？很简单，**只需要判断当前 Promise 的状态即可，如果还是 pending，则说明异步还未执行完**

```typescript
class MyPromise {
  private _result: unknown; // 私有变量，用于存放promise内函数的执行结果
  private _state: State; // 私有变量，记录当前promise的状态

  // 私有变量，存放成功和失败的回调，用数组，有可能多次then的情况
 private _onResolveCallback: ((value?: unknown) => void)[];
 private _onRejectCallback: ((reason?: unknown) => void)[];

  // 构造方法
  constructor(executor: Executor) {
    this._result = null;
    this._state = State.PENDING;
+   this._onResolveCallback = [];
+   this._onRejectCallback = [];
    // 执行传进来的函数
    try {
      executor(this._resolve, this._reject);
    } catch (err) {
      this._reject(err);
    }
  }

  private _resolve = (value?: unknown) => {
    if (this._state !== State.PENDING) return;
    // 如果执行resolve，状态变为fulfilled
    this._state = State.RESOLVE;
    // 终值为传进来的值
    this._result = value;

+   while (this._onResolveCallback.length > 0) {
+     this._onResolveCallback.shift()!(this._result);
+   }
  };

  private _reject = (reason?: unknown) => {
    if (this._state !== State.PENDING) return;
    // 如果执行reject，状态变为rejected
    this._state = State.REJECT;
    // 终值为传进来的reason
    this._result = reason;

+   while (this._onRejectCallback.length > 0) {
+     this._onRejectCallback.shift()!(this._result);
+   }
  };

  then = (
    onResolve: (value?: unknown) => void,
    onReject?: (reason?: unknown) => void
  ) => {
    if (this._state === State.RESOLVE) {
      // 如果当前为成功状态，执行第一个回调
      onResolve(this._result);
    } else if (this._state === State.REJECT) {
      // 如果当前为失败状态，执行第二哥回调
      onReject && onReject(this._result);
+   } else {
+     this._onResolveCallback.push(onResolve);
+     onReject && this._onRejectCallback.push(onReject);
+   }
  };
}

```

最后，我们再来实现链式调用，首先我们要明白链式调用的几个规则：

（a）then**返回一个新的 Promise 对象**

（b）**新的 Promise 的状态，取决于上一个 then 的返回值：如果返回值是 promise 对象，且状态为 resolve，新 promise 就是 resolve；如果返回值状态为 reject，新 promise 就是 reject；如果返回值非 promise 对象，新 promise 对象就是 reslove，且值为此返回值**

**最终实现：**

```typescript
enum State {
  PENDING = 'pending',
  RESOLVE = 'resolved',
  REJECT = 'rejected',
}

type Executor = (
  resolve: (value?: any) => MyPromise | any,
  reject: (reason?: any) => MyPromise | any
) => void;

class MyPromise {
  private _result: any; // 私有变量，用于存放promise内函数的执行结果
  private _state: State; // 私有变量，记录当前promise的状态

  // 私有变量，存放成功和失败的回调，用数组，有可能多次then的情况
  private _onResolveCallback: ((value?: any) => MyPromise | any)[];
  private _onRejectCallback: ((value?: any) => MyPromise | any)[];

  // 构造方法
  constructor(executor: Executor) {
    this._result = undefined;
    this._state = State.PENDING;
    this._onResolveCallback = [];
    this._onRejectCallback = [];
    // 执行传进来的函数
    try {
      executor(this._resolve, this._reject);
    } catch (err) {
      this._reject();
    }
  }

  private _resolve = (value?: any) => {
    if (this._state !== State.PENDING) return;
    // 如果执行resolve，状态变为fulfilled
    this._state = State.RESOLVE;
    // 终值为传进来的值
    this._result = value;

    while (this._onResolveCallback.length > 0) {
      this._onResolveCallback.shift()!(this._result);
    }
  };

  private _reject = (reason?: any) => {
    if (this._state !== State.PENDING) return;
    // 如果执行reject，状态变为rejected
    this._state = State.REJECT;
    // 终值为传进来的reason
    this._result = reason;

    while (this._onRejectCallback.length > 0) {
      this._onRejectCallback.shift()!(this._result);
    }
  };

  then = (
    onResolve: (value?: any) => MyPromise | any,
    onReject?: (reason?: any) => MyPromise | any
  ) => {
    const thenPromise = new MyPromise((resolve, reject) => {
      const resolvePromise = (callback: (value?: any) => MyPromise | any) => {
        try {
          const temp = callback(this._result);
          if (temp instanceof MyPromise) {
            temp.then(resolve, reject);
          } else {
            resolve(temp);
          }
        } catch (err) {
          // 处理报错
          reject();
        }
      };
      if (this._state === State.RESOLVE) {
        // 如果当前为成功状态，执行第一个回调
        resolvePromise(onResolve);
      } else if (this._state === State.REJECT) {
        // 如果当前为失败状态，执行第二个回调
        onReject && resolvePromise(onReject);
      } else {
        this._onResolveCallback.push(() => resolvePromise(onResolve));
        onReject && this._onRejectCallback.push(() => resolvePromise(onReject));
      }
    });

    // then方法最终返回一个promise
    return thenPromise;
  };
}
```

#### 3、Promise.all()

**使用：**

（a）接收一个 Promise 数组，数组中如有非 Promise 项，则该项直接 reslove 状态的 Promise

（b）如果所有 Promise 都成功，则返回成功结果数组

（c）如果有一个 Promise 失败，则返回这个失败结果

**实现：**

```typescript
  static all(promises: MyPromise[]) {
    const result: unknown[] = [];
    let count = 0;
    return new MyPromise((resolve, reject) => {
      const addData = (index: number, value: unknown) => {
        result[index] = value;
        count++;
        // 当所有都成功，讲最后的结果数组作为参数，传给resolve
        if (count === promises.length) resolve(result);
      };

      promises.forEach((promise, index) => {
        if (promise instanceof MyPromise) {
          // 是Promise，则调用then方法，如果成功，将其追加到结果数组中，失败直接reject
          promise.then(
            (res) => {
              addData(index, res);
            },
            (err) => reject(err)
          );
        } else {
          // 不是Promise，就相当于成功
          addData(index, promise);
        }
      });
    });
  }
```

#### 3、Promise.race()

**使用：**

（a）接收一个 Promise 数组，数组中如有非 Promise 项，则该项直接 reslove 状态的 Promise

（b）取最快返回结果的 Promise，无论成功失败

**实现：**

```typescript
  static race(promises: MyPromise[]) {
    return new MyPromise((resolve, reject) => {
      promises.forEach((promise) => {
        if (promise instanceof MyPromise) {
          promise.then(
            (res) => {
              resolve(res);
            },
            (err) => {
              reject(err);
            }
          );
        } else {
          resolve(promise);
        }
      });
    });
  }
```

#### 3、Promise.any()

**使用：**

（a）接收一个 Promise 数组，数组中如有非 Promise 项，则该项直接 reslove 状态的 Promise

（b）如果有一个 Promise 成功，则返回这个成功结果

（c）如果所有 Promise 都失败，则报错

**实现：**

```typescript
  static any(promises: MyPromise[]) {
    return new MyPromise((resolve, reject) => {
      let count = 0;
      promises.forEach((promise) => {
        promise.then(
          (val) => {
            resolve(val);
          },
          () => {
            count++;
            if (count === promises.length) {
              reject();
            }
          }
        );
      });
    });
  }
```

## 二、总结

Promise 的引入，极大的简化了 js 对异步的处理代码。不再出现回调地狱的问题。es7 之后提出的 async await 关键字，又进一步的简化了异步代码。通过手写实现基本的 Promise，可以帮助更加深入的理解 Promise。
