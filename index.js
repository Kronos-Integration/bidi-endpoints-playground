"use strict";

const Koa = require('koa');
const app = new Koa();

let endpoint1 = {
  get name() {
    "ep1"
  },
  feed: undefined
};


let endpoint2 = {
  get name() {
    "ep2"
  },
  connect(e) {
    this.counterpart = e;
  },
  set feed(feed) {
    this.counterpart.feed = feed;
  }
}

endpoint2.connect(endpoint1);


endpoint2.feed = function* () {
  let seq = 1;
  let request = yield;

  while (true) {
    request = yield `${request.url} ${seq}`;

    console.log(`got request: ${request.url}`);
    seq += 1;
  }
};


let it = endpoint1.feed();

app.use(ctx => {
  ctx.body = it.next(ctx.request).value;
});

app.listen(3000);
