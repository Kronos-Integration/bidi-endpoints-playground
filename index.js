/* jslint node: true, esnext: true */
"use strict";

const Koa = require('koa'),
  route = require('koa-route'),
  app = new Koa(),
  endpoints = require('./endpoints');


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

const endpoint1 = new endpoints.ReceiveEndpoint('ep1');

myStep(endpoint1);

const endpoint2 = new endpoints.SendEndpoint('ep2');
const endpoint3 = new endpoints.SendEndpoint('ep3');


endpoint2.connected = endpoint1;
endpoint3.connected = endpoint1;

endpoint3.inject(new endpoints.LoggingInterceptor('ic1'));


app.use(route.get('/a', ctx =>
  endpoint2.send(ctx.request).then((f, r) => {
    console.log(`body: ${f}`);
    ctx.body = f;
  })
));

app.use(route.get('/b', ctx =>
  endpoint3.send(ctx.request).then((f, r) => {
    console.log(`body: ${f}`);
    ctx.body = f;
  })
));

app.listen(3000);
