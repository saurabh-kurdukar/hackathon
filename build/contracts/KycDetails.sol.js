var Web3 = require("web3");
var SolidityEvent = require("web3/lib/web3/event.js");

(function() {
  // Planned for future features, logging, etc.
  function Provider(provider) {
    this.provider = provider;
  }

  Provider.prototype.send = function() {
    this.provider.send.apply(this.provider, arguments);
  };

  Provider.prototype.sendAsync = function() {
    this.provider.sendAsync.apply(this.provider, arguments);
  };

  var BigNumber = (new Web3()).toBigNumber(0).constructor;

  var Utils = {
    is_object: function(val) {
      return typeof val == "object" && !Array.isArray(val);
    },
    is_big_number: function(val) {
      if (typeof val != "object") return false;

      // Instanceof won't work because we have multiple versions of Web3.
      try {
        new BigNumber(val);
        return true;
      } catch (e) {
        return false;
      }
    },
    merge: function() {
      var merged = {};
      var args = Array.prototype.slice.call(arguments);

      for (var i = 0; i < args.length; i++) {
        var object = args[i];
        var keys = Object.keys(object);
        for (var j = 0; j < keys.length; j++) {
          var key = keys[j];
          var value = object[key];
          merged[key] = value;
        }
      }

      return merged;
    },
    promisifyFunction: function(fn, C) {
      var self = this;
      return function() {
        var instance = this;

        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {
          var callback = function(error, result) {
            if (error != null) {
              reject(error);
            } else {
              accept(result);
            }
          };
          args.push(tx_params, callback);
          fn.apply(instance.contract, args);
        });
      };
    },
    synchronizeFunction: function(fn, instance, C) {
      var self = this;
      return function() {
        var args = Array.prototype.slice.call(arguments);
        var tx_params = {};
        var last_arg = args[args.length - 1];

        // It's only tx_params if it's an object and not a BigNumber.
        if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
          tx_params = args.pop();
        }

        tx_params = Utils.merge(C.class_defaults, tx_params);

        return new Promise(function(accept, reject) {

          var decodeLogs = function(logs) {
            return logs.map(function(log) {
              var logABI = C.events[log.topics[0]];

              if (logABI == null) {
                return null;
              }

              var decoder = new SolidityEvent(null, logABI, instance.address);
              return decoder.decode(log);
            }).filter(function(log) {
              return log != null;
            });
          };

          var callback = function(error, tx) {
            if (error != null) {
              reject(error);
              return;
            }

            var timeout = C.synchronization_timeout || 240000;
            var start = new Date().getTime();

            var make_attempt = function() {
              C.web3.eth.getTransactionReceipt(tx, function(err, receipt) {
                if (err) return reject(err);

                if (receipt != null) {
                  // If they've opted into next gen, return more information.
                  if (C.next_gen == true) {
                    return accept({
                      tx: tx,
                      receipt: receipt,
                      logs: decodeLogs(receipt.logs)
                    });
                  } else {
                    return accept(tx);
                  }
                }

                if (timeout > 0 && new Date().getTime() - start > timeout) {
                  return reject(new Error("Transaction " + tx + " wasn't processed in " + (timeout / 1000) + " seconds!"));
                }

                setTimeout(make_attempt, 1000);
              });
            };

            make_attempt();
          };

          args.push(tx_params, callback);
          fn.apply(self, args);
        });
      };
    }
  };

  function instantiate(instance, contract) {
    instance.contract = contract;
    var constructor = instance.constructor;

    // Provision our functions.
    for (var i = 0; i < instance.abi.length; i++) {
      var item = instance.abi[i];
      if (item.type == "function") {
        if (item.constant == true) {
          instance[item.name] = Utils.promisifyFunction(contract[item.name], constructor);
        } else {
          instance[item.name] = Utils.synchronizeFunction(contract[item.name], instance, constructor);
        }

        instance[item.name].call = Utils.promisifyFunction(contract[item.name].call, constructor);
        instance[item.name].sendTransaction = Utils.promisifyFunction(contract[item.name].sendTransaction, constructor);
        instance[item.name].request = contract[item.name].request;
        instance[item.name].estimateGas = Utils.promisifyFunction(contract[item.name].estimateGas, constructor);
      }

      if (item.type == "event") {
        instance[item.name] = contract[item.name];
      }
    }

    instance.allEvents = contract.allEvents;
    instance.address = contract.address;
    instance.transactionHash = contract.transactionHash;
  };

  // Use inheritance to create a clone of this contract,
  // and copy over contract's static functions.
  function mutate(fn) {
    var temp = function Clone() { return fn.apply(this, arguments); };

    Object.keys(fn).forEach(function(key) {
      temp[key] = fn[key];
    });

    temp.prototype = Object.create(fn.prototype);
    bootstrap(temp);
    return temp;
  };

  function bootstrap(fn) {
    fn.web3 = new Web3();
    fn.class_defaults  = fn.prototype.defaults || {};

    // Set the network iniitally to make default data available and re-use code.
    // Then remove the saved network id so the network will be auto-detected on first use.
    fn.setNetwork("default");
    fn.network_id = null;
    return fn;
  };

  // Accepts a contract object created with web3.eth.contract.
  // Optionally, if called without `new`, accepts a network_id and will
  // create a new version of the contract abstraction with that network_id set.
  function Contract() {
    if (this instanceof Contract) {
      instantiate(this, arguments[0]);
    } else {
      var C = mutate(Contract);
      var network_id = arguments.length > 0 ? arguments[0] : "default";
      C.setNetwork(network_id);
      return C;
    }
  };

  Contract.currentProvider = null;

  Contract.setProvider = function(provider) {
    var wrapped = new Provider(provider);
    this.web3.setProvider(wrapped);
    this.currentProvider = provider;
  };

  Contract.new = function() {
    if (this.currentProvider == null) {
      throw new Error("KycDetails error: Please call setProvider() first before calling new().");
    }

    var args = Array.prototype.slice.call(arguments);

    if (!this.unlinked_binary) {
      throw new Error("KycDetails error: contract binary not set. Can't deploy new instance.");
    }

    var regex = /__[^_]+_+/g;
    var unlinked_libraries = this.binary.match(regex);

    if (unlinked_libraries != null) {
      unlinked_libraries = unlinked_libraries.map(function(name) {
        // Remove underscores
        return name.replace(/_/g, "");
      }).sort().filter(function(name, index, arr) {
        // Remove duplicates
        if (index + 1 >= arr.length) {
          return true;
        }

        return name != arr[index + 1];
      }).join(", ");

      throw new Error("KycDetails contains unresolved libraries. You must deploy and link the following libraries before you can deploy a new version of KycDetails: " + unlinked_libraries);
    }

    var self = this;

    return new Promise(function(accept, reject) {
      var contract_class = self.web3.eth.contract(self.abi);
      var tx_params = {};
      var last_arg = args[args.length - 1];

      // It's only tx_params if it's an object and not a BigNumber.
      if (Utils.is_object(last_arg) && !Utils.is_big_number(last_arg)) {
        tx_params = args.pop();
      }

      tx_params = Utils.merge(self.class_defaults, tx_params);

      if (tx_params.data == null) {
        tx_params.data = self.binary;
      }

      // web3 0.9.0 and above calls new twice this callback twice.
      // Why, I have no idea...
      var intermediary = function(err, web3_instance) {
        if (err != null) {
          reject(err);
          return;
        }

        if (err == null && web3_instance != null && web3_instance.address != null) {
          accept(new self(web3_instance));
        }
      };

      args.push(tx_params, intermediary);
      contract_class.new.apply(contract_class, args);
    });
  };

  Contract.at = function(address) {
    if (address == null || typeof address != "string" || address.length != 42) {
      throw new Error("Invalid address passed to KycDetails.at(): " + address);
    }

    var contract_class = this.web3.eth.contract(this.abi);
    var contract = contract_class.at(address);

    return new this(contract);
  };

  Contract.deployed = function() {
    if (!this.address) {
      throw new Error("Cannot find deployed address: KycDetails not deployed or address not set.");
    }

    return this.at(this.address);
  };

  Contract.defaults = function(class_defaults) {
    if (this.class_defaults == null) {
      this.class_defaults = {};
    }

    if (class_defaults == null) {
      class_defaults = {};
    }

    var self = this;
    Object.keys(class_defaults).forEach(function(key) {
      var value = class_defaults[key];
      self.class_defaults[key] = value;
    });

    return this.class_defaults;
  };

  Contract.extend = function() {
    var args = Array.prototype.slice.call(arguments);

    for (var i = 0; i < arguments.length; i++) {
      var object = arguments[i];
      var keys = Object.keys(object);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var value = object[key];
        this.prototype[key] = value;
      }
    }
  };

  Contract.all_networks = {
  "default": {
    "abi": [
      {
        "constant": true,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "getKycDetails",
        "outputs": [
          {
            "name": "name",
            "type": "uint256"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": true,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          }
        ],
        "name": "getData",
        "outputs": [
          {
            "name": "_email",
            "type": "string"
          }
        ],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [
          {
            "name": "_account",
            "type": "address"
          },
          {
            "name": "_name",
            "type": "string"
          },
          {
            "name": "_email",
            "type": "string"
          },
          {
            "name": "_phoneNo",
            "type": "string"
          },
          {
            "name": "_aadharNo",
            "type": "string"
          },
          {
            "name": "_panNo",
            "type": "string"
          },
          {
            "name": "_aadhar_file",
            "type": "string"
          },
          {
            "name": "_pan_file",
            "type": "string"
          },
          {
            "name": "_fingerprint",
            "type": "string"
          },
          {
            "name": "_credit_score",
            "type": "uint256"
          }
        ],
        "name": "createKycData",
        "outputs": [],
        "payable": false,
        "type": "function"
      },
      {
        "constant": false,
        "inputs": [],
        "name": "addKycDetails",
        "outputs": [],
        "payable": false,
        "type": "function"
      }
    ],
    "unlinked_binary": "0x606060405234610000575b610ae4806100186000396000f3606060405260e060020a60003504630abbe1f6811461003f57806338266b22146100615780637465e500146100df578063bc3443ce146102e2575b610000565b346100005761004f6004356102f1565b60408051918252519081900360200190f35b3461000057610071600435610339565b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156100d15780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b346100005760408051602060046024803582810135601f81018590048502860185019096528585526102e0958335959394604494939290920191819084018382808284375050604080516020601f89358b0180359182018390048302840183019094528083529799988101979196509182019450925082915084018382808284375050604080516020601f89358b0180359182018390048302840183019094528083529799988101979196509182019450925082915084018382808284375050604080516020601f89358b0180359182018390048302840183019094528083529799988101979196509182019450925082915084018382808284375050604080516020601f89358b0180359182018390048302840183019094528083529799988101979196509182019450925082915084018382808284375050604080516020601f89358b0180359182018390048302840183019094528083529799988101979196509182019450925082915084018382808284375050604080516020601f89358b0180359182018390048302840183019094528083529799988101979196509182019450925082915084018382808284375050604080516020601f89358b01803591820183900483028401830190945280835297999881019791965091820194509250829150840183828082843750949650509335935061042692505050565b005b34610000576102e0610ad6565b005b50735da9be430b5374267c16928a5aa3619964d6d795600081905260016020527f0b876d3aa85afae94582919c60dcedc92e636d0f27ada1674ff8fc0ff90cd61a545b919050565b60408051602080820183526000808352600160a060020a03851681526001918290529290922082015490916002908216156101000260001901909116041561033457600160a060020a0382166000908152600160208181526040928390206002908101805485519481161561010002600019011691909104601f81018390048302840183019094528383529192908301828280156104185780601f106103ed57610100808354040283529160200191610418565b820191906000526020600020905b8154815290600101906020018083116103fb57829003601f168201915b505050505090505b5b919050565b610140604051908101604052806000815260200160206040519081016040528060008152602001508152602001602060405190810160405280600081526020015081526020016020604051908101604052806000815260200150815260200160206040519081016040528060008152602001508152602001602060405190810160405280600081526020015081526020016020604051908101604052806000815260200150815260200160206040519081016040528060008152602001508152602001602060405190810160405280600081526020015081526020016000815260200150610140604051908101604052808c81526020018b81526020018a815260200189815260200188815260200187815260200186815260200185815260200184815260200183815260200150905080600160008d600160a060020a0316815260200190815260200160002060008201518160000160006101000a815481600160a060020a0302191690836c010000000000000000000000009081020402179055506020820151816001019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106105fb57805160ff1916838001178555610628565b82800160010185558215610628579182015b8281111561062857825182559160200191906001019061060d565b5b506106499291505b808211156106455760008155600101610631565b5090565b50506040820151816002019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061069d57805160ff19168380011785556106ca565b828001600101855582156106ca579182015b828111156106ca5782518255916020019190600101906106af565b5b506106eb9291505b808211156106455760008155600101610631565b5090565b50506060820151816003019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061073f57805160ff191683800117855561076c565b8280016001018555821561076c579182015b8281111561076c578251825591602001919060010190610751565b5b5061078d9291505b808211156106455760008155600101610631565b5090565b50506080820151816004019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106107e157805160ff191683800117855561080e565b8280016001018555821561080e579182015b8281111561080e5782518255916020019190600101906107f3565b5b5061082f9291505b808211156106455760008155600101610631565b5090565b505060a0820151816005019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061088357805160ff19168380011785556108b0565b828001600101855582156108b0579182015b828111156108b0578251825591602001919060010190610895565b5b506108d19291505b808211156106455760008155600101610631565b5090565b505060c0820151816006019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061092557805160ff1916838001178555610952565b82800160010185558215610952579182015b82811115610952578251825591602001919060010190610937565b5b506109739291505b808211156106455760008155600101610631565b5090565b505060e0820151816007019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106109c757805160ff19168380011785556109f4565b828001600101855582156109f4579182015b828111156109f45782518255916020019190600101906109d9565b5b50610a159291505b808211156106455760008155600101610631565b5090565b5050610100820151816008019080519060200190828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f10610a6a57805160ff1916838001178555610a97565b82800160010185558215610a97579182015b82811115610a97578251825591602001919060010190610a7c565b5b50610ab89291505b808211156106455760008155600101610631565b5090565b505061012082015181600901559050505b5050505050505050505050565b610ae06001610339565b505b56",
    "events": {},
    "updated_at": 1481857426679,
    "links": {},
    "address": "0x363501bfb4ca254477fc2e3411d988ef82bc1cc3"
  }
};

  Contract.checkNetwork = function(callback) {
    var self = this;

    if (this.network_id != null) {
      return callback();
    }

    this.web3.version.network(function(err, result) {
      if (err) return callback(err);

      var network_id = result.toString();

      // If we have the main network,
      if (network_id == "1") {
        var possible_ids = ["1", "live", "default"];

        for (var i = 0; i < possible_ids.length; i++) {
          var id = possible_ids[i];
          if (Contract.all_networks[id] != null) {
            network_id = id;
            break;
          }
        }
      }

      if (self.all_networks[network_id] == null) {
        return callback(new Error(self.name + " error: Can't find artifacts for network id '" + network_id + "'"));
      }

      self.setNetwork(network_id);
      callback();
    })
  };

  Contract.setNetwork = function(network_id) {
    var network = this.all_networks[network_id] || {};

    this.abi             = this.prototype.abi             = network.abi;
    this.unlinked_binary = this.prototype.unlinked_binary = network.unlinked_binary;
    this.address         = this.prototype.address         = network.address;
    this.updated_at      = this.prototype.updated_at      = network.updated_at;
    this.links           = this.prototype.links           = network.links || {};
    this.events          = this.prototype.events          = network.events || {};

    this.network_id = network_id;
  };

  Contract.networks = function() {
    return Object.keys(this.all_networks);
  };

  Contract.link = function(name, address) {
    if (typeof name == "function") {
      var contract = name;

      if (contract.address == null) {
        throw new Error("Cannot link contract without an address.");
      }

      Contract.link(contract.contract_name, contract.address);

      // Merge events so this contract knows about library's events
      Object.keys(contract.events).forEach(function(topic) {
        Contract.events[topic] = contract.events[topic];
      });

      return;
    }

    if (typeof name == "object") {
      var obj = name;
      Object.keys(obj).forEach(function(name) {
        var a = obj[name];
        Contract.link(name, a);
      });
      return;
    }

    Contract.links[name] = address;
  };

  Contract.contract_name   = Contract.prototype.contract_name   = "KycDetails";
  Contract.generated_with  = Contract.prototype.generated_with  = "3.2.0";

  // Allow people to opt-in to breaking changes now.
  Contract.next_gen = false;

  var properties = {
    binary: function() {
      var binary = Contract.unlinked_binary;

      Object.keys(Contract.links).forEach(function(library_name) {
        var library_address = Contract.links[library_name];
        var regex = new RegExp("__" + library_name + "_*", "g");

        binary = binary.replace(regex, library_address.replace("0x", ""));
      });

      return binary;
    }
  };

  Object.keys(properties).forEach(function(key) {
    var getter = properties[key];

    var definition = {};
    definition.enumerable = true;
    definition.configurable = false;
    definition.get = getter;

    Object.defineProperty(Contract, key, definition);
    Object.defineProperty(Contract.prototype, key, definition);
  });

  bootstrap(Contract);

  if (typeof module != "undefined" && typeof module.exports != "undefined") {
    module.exports = Contract;
  } else {
    // There will only be one version of this contract in the browser,
    // and we can use that.
    window.KycDetails = Contract;
  }
})();
