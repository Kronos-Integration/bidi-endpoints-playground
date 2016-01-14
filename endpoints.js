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

  addInterceptor(newInterceptor) {
    newInterceptor.connected = this;

    if (this.interceptors > 0) {
      const lastInterceptor = this.interceptors[this.interceptors.lastIndexOf()];
      lastInterceptor.connected = newInterceptor;
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

  addInterceptor(newInterceptor) {
    super.addInterceptor(newInterceptor);
    this.receiver = this.interceptors[0];
  }

  set connected(e) {
    if (this.interceptors.length === 0) {
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
