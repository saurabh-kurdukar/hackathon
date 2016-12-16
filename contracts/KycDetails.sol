pragma solidity ^0.4.6;
contract KycDetails {

struct Kyc{
    address account;
    string name;
    string email;
    string phoneNo;
    string aadharNo;
    string panNo;
    string aadhar_file;
    string pan_file;
    string fingerprint;
    uint credit_score;
}

address k;
mapping(address => Kyc) kycs;

function addKycDetails() {

// createKycData(1,'ncdii','abc@gmail.com','43536','sfg','242rf','rewr4','dww4w','dwre454',4);
    getData(1);

                }

  function createKycData(address _account,string _name, string _email, string _phoneNo, string _aadharNo, string _panNo, string _aadhar_file,
  string _pan_file, string _fingerprint, uint _credit_score) {

    var _kyc = Kyc({
      account: _account,
      name: _name,
      email: _email,
      phoneNo:_phoneNo,
      aadharNo:_aadharNo,
      panNo:_panNo,
      aadhar_file:_aadhar_file,
      pan_file:_pan_file,
      fingerprint:_fingerprint,
      credit_score:_credit_score
    });

    kycs[_account] =_kyc;
    //return kycs[_account];
}


function getKycDetails(address _account) constant
    returns (uint name) {
    _account = 0x5da9be430b5374267c16928a5aa3619964d6d795;
    name = kycs[_account].credit_score;
  }

  function getData(address _account) constant returns (string  _email) {
    if(bytes(kycs[_account].name).length != 0) {
      _email = kycs[_account].email;
    // _email= 'dehffrb';
    }
  }
}
