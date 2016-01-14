/* jslint node: true, esnext: true */

"use strict";

const connectorMixin = (superclass) => class extends superclass {
  set connected(e) {
    this._connected = e;
  }

  get connected() {
    return this._connected;
  }

  get isConnected() {
    return this._connected ? true : false;
  }

  injectNext(endpoint) {
    endpoint.connected = this.connected;
    this.connected = endpoint;
  }

  removeNext() {
    if (this.isConnected) {
      this.connected = this.connected.connected;
    }
  }
};

class Endpoint {
  constructor(name) {
    Object.defineProperty(this, 'name', {
      value: name
    });
  }

  get hasInterceptors() {
    return this._firstInterceptor !== undefined;
  }

  get firstInterceptor() {
    return this._firstInterceptor;
  }

  get lastInterceptor() {
    let i = this._firstInterceptor;
    if (i === undefined) return undefined;
    do {
      if (!i.isConnected) return i;
    }
    while (i = i.connected);

    return undefined;
  }

  get interceptors() {
    const itcs = [];
    let i = this.firstInterceptor;
    while (i) {
      if (i === this) break;
      itcs.push(i);
      i = i.connected;
    }

    return itcs;
  }

  set interceptors(newInterceptors) {
    if (newInterceptors === undefined ||  newInterceptors.length === 0) {
      this._firstInterceptor = undefined;
    } else {
      this._firstInterceptor = newInterceptors[0];
      newInterceptors.reduce((previous, current) => previous.connected = current, newInterceptors[0]);
    }
  }

  get isIn() {
    return false;
  }
  get isOut() {
    return false;
  }
  toString() {
    return this.name;
  }
}

class ReceiveEndpoint extends Endpoint {
  forward(request) {
    return this._receive(request);
  }

  get receive() {
    if (this.hasInterceptors) {
      return this.firstInterceptor.forward;
    } else {
      return this._receive;
    }
  }

  set receive(receive) {
    this._receive = receive;
  }

  get isIn() {
    return true;
  }
}


class SendEndpoint extends connectorMixin(Endpoint) {
  get isOut() {
    return true;
  }

  // TODO why is this required ?
  get interceptors() {
    return super.interceptors;
  }

  set interceptors(newInterceptors) {
    super.interceptors = newInterceptors;
    this.receiver = this.firstInterceptor;
    this.lastInterceptor.connected = this;
  }

  /*
    get connected() {
      return this.lastInterceptor.connected;
    }
  */

  set connected(e) {
    //this.lastInterceptor.connected = e;

    if (!this.hasInterceptors) {
      this.receiver = e;
    }
    this._connected = e;
  }

  receive(request) {
    return this._connected.receive(request);
  }

  send(request) {
    return this.receiver.receive(request);
  }
}


class LoggingInterceptor extends connectorMixin(Endpoint) {
  receive(request) {
    const start = new Date();
    const response = this.connected.receive(request);
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
