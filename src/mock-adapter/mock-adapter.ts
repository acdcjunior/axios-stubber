"use strict";

import handleRequest from "./handle-request";
import * as utils from "./utils";
import { AxiosAdapter } from "axios";

const VERBS = [
  "get",
  "post",
  "head",
  "delete",
  "patch",
  "put",
  "options",
  "list",
];

function getVerbObject() {
  return VERBS.reduce((accumulator, verb) => { accumulator[verb] = []; return accumulator; }, {});
}

export default class AxiosMockAdapter {
  private axiosInstance: any;
  private readonly originalAdapter: AxiosAdapter;
  private delayResponse: any;
  private onNoMatch: any;
  private handlers: {};
  private history: {};

  constructor(axiosInstance, options?) {
    this.reset();

    if (!axiosInstance) throw new Error("Please provide an instance of axios to mock");

    this.axiosInstance = axiosInstance;
    this.originalAdapter = axiosInstance.defaults.adapter;
    this.delayResponse = options?.delayResponse > 0 ? options.delayResponse : null;
    this.onNoMatch = options?.onNoMatch ?? null;
    axiosInstance.defaults.adapter = this.adapter();
  }

  adapter() {
    return function (config) {
      const mockAdapter = this;
      // axios >= 0.13.0 only passes the config and expects a promise to be
      // returned. axios < 0.13.0 passes (config, resolve, reject).
      if (arguments.length === 3) {
        handleRequest(mockAdapter, arguments[0], arguments[1], arguments[2]);
      } else {
        return new Promise(function (resolve, reject) {
          handleRequest(mockAdapter, resolve, reject, config);
        });
      }
    }.bind(this);
  }

  restore() {
    if (this.axiosInstance) {
      this.axiosInstance.defaults.adapter = this.originalAdapter;
      this.axiosInstance = undefined;
    }
  };

  reset() {
    this.resetHandlers();
    this.resetHistory();
  }

  resetHandlers() {
    this.handlers = getVerbObject();
  }

  resetHistory() {
    this.history = getVerbObject();
  }

}

VERBS.concat("any").forEach(method => {
  const methodName = "on" + method.charAt(0).toUpperCase() + method.slice(1);

  AxiosMockAdapter.prototype[methodName] = function (matcherArg, body, requestHeaders) {
    const _this = this;
    const matcher = matcherArg === undefined ? /.*/ : matcherArg;

    function reply(code, response?, headers?) {
      const handler = [matcher, body, requestHeaders, code, response, headers];
      addHandler(method, _this.handlers, handler);
      return _this;
    }

    function replyOnce(code, response?, headers?) {
      const handler = [
        matcher,
        body,
        requestHeaders,
        code,
        response,
        headers,
        true,
      ];
      addHandler(method, _this.handlers, handler);
      return _this;
    }

    return {
      reply: reply,

      replyOnce: replyOnce,

      passThrough: function passThrough() {
        const handler = [matcher, body];
        addHandler(method, _this.handlers, handler);
        return _this;
      },

      abortRequest: function () {
        return reply(function (config) {
          const error = utils.createAxiosError(
            "Request aborted",
            config,
            undefined,
            "ECONNABORTED"
          );
          return Promise.reject(error);
        });
      },

      abortRequestOnce: function () {
        return replyOnce(function (config) {
          const error = utils.createAxiosError(
            "Request aborted",
            config,
            undefined,
            "ECONNABORTED"
          );
          return Promise.reject(error);
        });
      },

      networkError: function () {
        return reply(function (config) {
          const error = utils.createAxiosError("Network Error", config);
          return Promise.reject(error);
        });
      },

      networkErrorOnce: function () {
        return replyOnce(function (config) {
          const error = utils.createAxiosError("Network Error", config);
          return Promise.reject(error);
        });
      },

      timeout: function () {
        return reply(function (config) {
          const error = utils.createAxiosError(
            config.timeoutErrorMessage ||
            "timeout of " + config.timeout + "ms exceeded",
            config,
            undefined,
            "ECONNABORTED"
          );
          return Promise.reject(error);
        });
      },

      timeoutOnce: function () {
        return replyOnce(function (config) {
          const error = utils.createAxiosError(
            config.timeoutErrorMessage ||
            "timeout of " + config.timeout + "ms exceeded",
            config,
            undefined,
            "ECONNABORTED"
          );
          return Promise.reject(error);
        });
      },
    };
  };
});

function findInHandlers(method, handlers, handler) {
  let index = -1;
  for (let i = 0; i < handlers[method].length; i += 1) {
    const item = handlers[method][i];
    const isReplyOnce = item.length === 7;
    const comparePaths =
      item[0] instanceof RegExp && handler[0] instanceof RegExp
        ? String(item[0]) === String(handler[0])
        : item[0] === handler[0];
    const isSame =
      comparePaths &&
      utils.isEqual(item[1], handler[1]) &&
      utils.isEqual(item[2], handler[2]);
    if (isSame && !isReplyOnce) {
      index = i;
    }
  }
  return index;
}

function addHandler(method, handlers, handler) {
  if (method === "any") {
    VERBS.forEach(function (verb) {
      handlers[verb].push(handler);
    });
  } else {
    const indexOfExistingHandler = findInHandlers(method, handlers, handler);
    if (indexOfExistingHandler > -1 && handler.length < 7) {
      handlers[method].splice(indexOfExistingHandler, 1, handler);
    } else {
      handlers[method].push(handler);
    }
  }
}
