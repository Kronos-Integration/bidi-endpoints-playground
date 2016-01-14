/* jslint node: true, esnext: true */
"use strict";

const Koa = require('koa'),
  route = require('koa-route'),
  app = new Koa(),
  endpoints = require('./endpoints');


const step1 = {
  endpoints: {
    'send1': new endpoints.SendEndpoint('send1'),
    'send2': new endpoints.SendEndpoint('send2')
  },

  initialize() {
    app.use(route.get('/a', ctx =>
      this.endpoints.send1.send(ctx.request).then((f, r) => {
        console.log(`a body: ${f}`);
        ctx.body = f;
      })
    ));

    app.use(route.get('/b', ctx =>
      this.endpoints.send2.send(ctx.request).then((f, r) => {
        console.log(`b body: ${f}`);
        ctx.body = f;
      })
    ));

    app.listen(3000);
  }
};

const step2 = {
  endpoints: {
    'receive': new endpoints.ReceiveEndpoint('receive')
  },

  initialize() {
    let sequence = 0;

    this.endpoints.receive.receive = request => {
      sequence += 1;

      return new Promise((f, r) => {
        setTimeout(
          () => f(`result of ${request.url} ${sequence}`),
          50);
      });
    };
  }
};


step1.initialize();
step2.initialize();


step1.endpoints.send1.connected = step2.endpoints.receive;
step1.endpoints.send2.connected = step2.endpoints.receive;

step1.endpoints.send1.interceptors = [new endpoints.LoggingInterceptor('ics1'),
  new endpoints.LoggingInterceptor('ics2'),
  new endpoints.LoggingInterceptor('ics3'),
  new endpoints.LoggingInterceptor('ics4')
];

console.log(`Interceptors: ${step1.endpoints.send1.interceptors}`);

//step2.endpoints.receive.interceptors = [new endpoints.LoggingInterceptor('icr1')];
