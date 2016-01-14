/* jslint node: true, esnext: true */

"use strict";

const connectorMixin = (superclass) => class extends superclass {
  set connected(e) {
    this._connected = e;
  }

  get connected() {
    return this._connected;
  }

};

class Endpoint {
  constructor(name) {
    Object.defineProperty(this, 'name', {
      value: name
    });

    let interceptors = [];
    Object.defineProperty(this, 'interceptors', {
      value: interceptors
    });
  }

  add(newInterceptor) {
    if (this.interceptors > 0) {
      const lastInterceptor = this.interceptors[this.interceptors.lastIndexOf()];
      newInterceptor.connected = this;
      lastInterceptor.connected = newInterceptor;
    } else {
      newInterceptor.connected = this;
    }
    this.interceptors.push(newInterceptor);
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
    if (this.interceptors > 0) {
      return this.interceptors[0].forward;
    } else {
      return this._receive;
    }
  }

  get isIn() {
    return true;
  }

  set receive(receive) {
    this._receive = receive;
  }
}


class SendEndpoint extends connectorMixin(Endpoint) {
  get isOut() {
    return true;
  }

  add(newInterceptor) {
    super(newInterceptor);
    this.receiver = this.interceptors[0];
  }

  set connected(e) {
    if (this.interceptors === 0) {
      this.receiver = e;
    }
    this._connected = e;
  }

  forward(request) {
    return this.connected.receive(request);
  }
}



class LoggingInterceptor extends connectorMixin(Endpoint) {
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
