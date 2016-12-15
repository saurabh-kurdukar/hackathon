angular.module('metaApp', [])
.controller('MetaController', function($scope, $timeout) {
  var mc = this;
  mc.welcomeMessage = "Hello User";
  mc.acc = {};
  mc.acc.balance = 0;
  $timeout(function() {
    mc.getAccounts();
  }, 2000);

  mc.getAccounts = function() {
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      console.log(JSON.stringify(accs));
      mc.acc.account = accounts[0];
      mc.refreshBalance();
    });
  };

  mc.refreshBalance = function() {
    var meta = MetaCoin.deployed();

    meta.getBalance.call(mc.acc.account, {from: mc.acc.account}).then(function(value) {
      mc.acc.balance = value.valueOf();
      $scope.$digest();
      return null;
    }).catch(function(e) {
      console.log(e);
      mc.status = "Error getting balance; see log.";
      $scope.$digest();
      return null;
    });
  };

  mc.sendCoin = function () {
    var meta = MetaCoin.deployed();

    var amount = mc.amount;
    var receiver = mc.receiver;

    mc.status = "Initiating transaction... (please wait)";

    meta.sendCoin(receiver, amount, {from: mc.acc.account})
    .then(function() {
      mc.status = "Transaction complete!";
      mc.refreshBalance();
      return null;
    })
    .catch(function(e) {
      console.log(e);
      mc.status = "Error sending coin; see log.";
    });
  };

  mc.viewBlocks = function () {

    web3.eth.getBlockNumber(function(error, result){
        console.log(result);
        web3.eth.getBlock(result, function(err, obj) {
          console.log(err);

          console.log(obj);
        });

    });
  };

});
