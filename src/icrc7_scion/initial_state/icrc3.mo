import ICRC3 "mo:icrc3-mo";

module{
  public let defaultConfig = func(caller: Principal) : ICRC3.InitArgs {
    ?{
          maxActiveRecords = 4000;
          settleToRecords = 2000;
          maxRecordsInArchiveInstance = 5_000_000;
          maxArchivePages  = 62500; //allows up to 993 bytes per record
          archiveIndexType = #Stable;
          maxRecordsToArchive = 10_000;
          archiveCycles = 2_000_000_000_000; //two trillion
          archiveControllers = null;
          supportedBlocks = [];
      }
  };
};