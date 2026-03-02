import Map "mo:core/Map";
import Text "mo:core/Text";
import Float "mo:core/Float";

module {
  type User = {
    id : Text;
    name : Text;
    email : Text;
    passwordHash : Text;
    isActivated : Bool;
    activationCode : ?Text;
  };

  type BankAccount = {
    id : Text;
    userId : Text;
    bankName : Text;
    holderName : Text;
    accountNumber : Text;
    ifscCode : Text;
    mobileNumber : Text;
    ibId : Text;
    ibPassword : Text;
    upiId : Text;
    fundType : Text;
    status : Text;
    submittedAt : Text;
    transactionEnabled : ?Bool;
    transactionEnabledFunds : ?Text;
  };

  type ActivationCode = {
    code : Text;
    isUsed : Bool;
    usedBy : ?Text;
    generatedAt : Text;
  };

  type Withdrawal = {
    id : Text;
    userId : Text;
    method : Text;
    amount : Float;
    bankDetails : ?Text;
    transactionId : Text;
    date : Text;
    time : Text;
    status : Text;
    bankName : ?Text;
    accountNumber : ?Text;
    holderName : ?Text;
    ifscCode : ?Text;
  };

  type LiveTransaction = {
    id : Text;
    fundType : Text;
    txnType : Text;
    amount : Float;
    timestamp : Text;
    bankAccountId : ?Text;
  };

  type AccumulatedCommission = {
    total : Float;
    lastUpdated : Text;
  };

  type EmptyActor = {};
  type NewActor = {
    users : Map.Map<Text, User>;
    bankAccounts : Map.Map<Text, BankAccount>;
    activationCodes : Map.Map<Text, ActivationCode>;
    withdrawals : Map.Map<Text, Withdrawal>;
    liveTransactions : Map.Map<Text, LiveTransaction>;
    supportLink : Text;
    accumulatedCommission : AccumulatedCommission;
  };

  public func run(_ : EmptyActor) : NewActor {
    {
      users = Map.empty<Text, User>();
      bankAccounts = Map.empty<Text, BankAccount>();
      activationCodes = Map.empty<Text, ActivationCode>();
      withdrawals = Map.empty<Text, Withdrawal>();
      liveTransactions = Map.empty<Text, LiveTransaction>();
      supportLink = "https://t.me/+mFXyrEOTRU1lYzg1";
      accumulatedCommission = {
        total = 0.0;
        lastUpdated = "2023-07-04T12:00:00Z";
      };
    };
  };
};
