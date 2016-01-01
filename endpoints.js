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

class SendEndpoint extends Endpoint {
  set connected(e) {
    this._connected = e;
  }

  get connected() {
    return this._connected;
  }

  send(request) {
    return this.connected.receive(request);
  }
}

class LoggingInterceptor extends SendEndpoint {
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
