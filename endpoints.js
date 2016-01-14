/* jslint node: true, esnext: true */

"use strict";


class Endpoint {
  constructor(name) {
    Object.defineProperty(this, 'name', {
      value: name
    });
  }

  toString() {
    return this.name;
  }
}

class ReceiveEndpoint extends Endpoint {
  get forward() {
    return this._forward;
  }

  set forward(forward) {
    this._forward = forward;
  }
}

const ConnectorMixin = (superclass) => class extends superclass {
  set connected(e) {
    this._connected = e;
  }

  get connected() {
    return this._connected;
  }

  inject(endpoint) {
    endpoint.connected = this.connected;
    this.connected = endpoint;
  }
};

class SendEndpoint extends ConnectorMixin(Endpoint) {
  forward(request) {
    return this.connected.forward(request);
  }
}

class LoggingInterceptor extends ConnectorMixin(Endpoint) {
  forward(request) {
    const start = new Date();
    const response = this.connected.forward(request);
    return response.then(f => {
      const now = new Date();
      console.log(`${this.name}: took ${now - start}ms for ${request.url}`);
      return f;
    });
  }
}

exports.Endpoint = Endpoint;
exports.ReceiveEndpoint = ReceiveEndpoint;
exports.SendEndpoint = SendEndpoint;
exports.LoggingInterceptor = LoggingInterceptor;
