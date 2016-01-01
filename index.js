/* jslint node: true, esnext: true */
"use strict";

const Koa = require('koa');
const app = new Koa();

let endpoint1 = {
  get name() {
    return "ep1";
  },

  set generator(generator) {
    this._generator = generator;
  },
  get generator() {
    return this._generator;
  }
};


let endpoint2 = {
  get name() {
    return "ep2";
  },
  connect(e) {
    this.counterpart = e;
  },
  set generator(generator) {
    this.counterpart.generator = generator;
  },
  get generator() {
    return this.counterpart.generator;
  }
};

endpoint2.connect(endpoint1);


endpoint2.generator = function* () {
  let seq = 1;
  let result;

  let request = yield;

  //console.log(`A got request: ${request.url}`);

  while (true) {
    request = yield new Promise((f, r) => {
      setTimeout(
        () => {
          f(`result of ${request.url} ${seq}`);
        },
        1000
      );
    });

    //console.log(`B got request: ${request.url}`);
    seq += 1;
  }
};


let iterator = endpoint1.generator();

app.use(ctx => {
  let p = iterator.next(ctx.request).value;

  if (p) {
    return p.then((f, r) => {
      //console.log(`body: ${f}`);
      ctx.body = f;
    });
  }
});

app.listen(3000);
