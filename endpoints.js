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
  get receive() {
    return this._receive;
  }

  set receive(receive) {
    this._receive = receive;
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
}

class SendEndpoint extends ConnectorMixin(Endpoint) {
  send(request) {
    return this.connected.receive(request);
  }
}

class LoggingInterceptor extends ConnectorMixin(Endpoint) {
  receive(request) {
    const start = new Date();
    const response = this.connected.receive(request);
    return response.then(f => {
      const now = new Date();
      console.log(`took ${now - start}ms for ${request.url}`);
      return f;
    });
  }
}

exports.Endpoint = Endpoint;
exports.ReceiveEndpoint = ReceiveEndpoint;
exports.SendEndpoint = SendEndpoint;
exports.LoggingInterceptor = LoggingInterceptor;
