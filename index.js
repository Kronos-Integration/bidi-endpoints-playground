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
      this.endpoints.send1.forward(ctx.request).then((f, r) => {
        console.log(`a body: ${f}`);
        ctx.body = f;
      })
    ));

    app.use(route.get('/b', ctx =>
      this.endpoints.send2.forward(ctx.request).then((f, r) => {
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

    this.endpoints.receive.forward = request => {
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


step1.endpoints.send1.inject(new endpoints.LoggingInterceptor('ic1'));
step1.endpoints.send1.inject(new endpoints.LoggingInterceptor('ic2'));
