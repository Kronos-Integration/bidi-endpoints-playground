"use strict";

const Koa = require('koa');
const app = new Koa();

const endpoint1 = {
  get name() {
    return "ep1";
  },

  get receive() {
    return this._receive;
  },

  set receive(receive) {
    this._receive = receive;
  }
};

const endpoint2 = {
  get name() {
    return "ep2";
  },

  set connected(e) {
    this._connected = e;
  },

  get connected() {
    return this._connected;
  },

  send(request) {
    return this.connected.receive(request);
  }
}

endpoint2.connected = endpoint1;


function myStep(endpoint) {
  let sequence = 0;

  endpoint.receive = request => {
    sequence += 1;

    return new Promise((f, r) => {
      setTimeout(
        () => f(`result of ${request.url} ${sequence}`),
        50);
    });
  };
}

myStep(endpoint1);


app.use(ctx => {
  let p = endpoint2.send(ctx.request);

  return p.then((f, r) => {
    console.log(`body: ${f}`);
    ctx.body = f;
  });
});

app.listen(3000);
