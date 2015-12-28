"use strict";

const Koa = require('koa');
const app = new Koa();


let it = mygen();

app.use(ctx => {

  ctx.body = it.next(ctx.request.url).value;
});

app.listen(3000);


function* mygen() {
  let seq = 1;
  let request;

  while (true) {
    request = yield `${request} ${seq}`;

    console.log(`got request: ${request}`);
    seq += 1;
  }
}
