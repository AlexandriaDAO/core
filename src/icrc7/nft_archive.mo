import ICRC7 "mo:icrc7-mo";
import Principal "mo:base/Principal";
import D "mo:base/Debug";
import Array "mo:base/Array";

module {
  // Define a type for the variable parts of each NFT
  type NFTData = {
    token_id: Nat;
    owner: Principal;
    description: Text;
  };

  public func initialize_nfts(icrc7: ICRC7.ICRC7, caller: Principal) : async () {
    let base_nft : ICRC7.SetNFTItemRequest = {
      created_at_time = null;
      memo = null;
      metadata = #Text(""); // Use an empty string as a placeholder
      override = false;
      owner = null; // This will be overwritten
      token_id = 0; // This will be overwritten
    };

    // Define the variable data for each NFT
    let nft_data : [NFTData] = [
      { token_id = 101_402_859_615_123_070_939_606_806_776_952_079_016_618_008_609_101_970_860_422_354_949_319_130_091_570; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 90_478_665_615_071_160_744_864_710_225_799_387_668_426_035_757_448_060_111_658_411_790_698_032_413_685; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 87_668_857_456_617_766_424_645_245_333_960_350_606_546_627_688_158_909_335_544_304_975_675_022_684_768; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 35_460_773_196_088_891_412_164_545_647_606_806_408_155_408_808_293_448_922_466_332_275_685_524_628_152; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 107_104_619_015_628_023_523_798_100_021_274_646_110_565_209_359_551_281_421_932_721_366_560_562_199_932; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 102_877_892_303_350_671_016_672_256_082_758_584_227_932_825_928_563_183_504_356_870_969_691_074_058_136; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 111_750_079_454_434_919_069_535_654_417_017_718_256_211_228_193_430_695_795_724_260_863_223_144_224_613; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 9_463_264_719_163_364_902_502_623_956_944_907_042_431_325_237_330_207_656_570_245_832_191_320_743_907; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 45_329_111_289_820_923_449_746_619_649_408_880_701_235_163_798_943_575_034_690_061_436_635_941_481_526; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 114_364_351_708_711_281_145_145_913_467_043_984_519_424_225_122_965_878_631_548_090_513_926_145_998_569; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 45_967_800_224_089_115_037_520_503_566_385_984_676_633_681_892_844_092_003_312_196_076_630_015_020_008; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 21_881_551_581_427_196_837_761_542_728_650_756_598_873_974_770_845_246_550_612_136_702_075_925_668_122; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 17_317_142_639_521_294_270_246_193_804_528_353_524_698_709_786_929_097_858_069_270_735_277_789_904_035; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 32_720_997_695_805_917_423_917_894_449_225_587_414_692_259_543_770_303_285_356_448_051_801_775_799_942; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 37_527_670_239_234_603_292_287_678_198_404_711_363_956_122_513_781_219_017_697_106_732_131_498_037_969; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 115_283_945_617_752_207_133_346_186_980_610_524_696_655_095_426_218_937_628_942_717_127_380_861_927_718; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 26_708_957_040_206_974_436_086_443_361_952_662_516_776_252_443_504_024_980_929_648_423_671_344_082_563; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 11_562_463_898_387_523_719_582_310_270_532_182_832_989_953_045_770_431_988_777_766_843_998_017_095_059; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 95_494_965_975_862_778_377_681_256_123_674_370_785_771_248_114_097_535_477_211_828_991_753_798_890_235; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 104_349_526_095_540_846_777_035_623_714_683_792_285_123_871_664_660_909_022_943_869_635_063_877_470_210; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 8_825_113_508_993_827_763_330_833_628_628_832_860_209_320_861_635_372_994_409_009_438_899_292_340_005; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 15_704_187_296_282_643_312_341_988_413_032_719_496_407_583_299_398_941_228_079_201_220_852_064_967_227; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 32_095_165_477_949_745_370_568_104_447_701_253_130_931_837_497_565_875_143_158_811_587_201_346_074_962; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 4_655_691_022_004_100_049_281_282_539_809_391_186_418_756_373_509_373_364_139_459_618_596_876_600_470; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 96_443_827_495_581_357_206_056_413_825_285_972_470_278_657_093_842_778_878_102_534_183_532_295_774_857; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 23_863_697_532_035_565_206_495_092_193_617_261_354_764_389_145_343_113_012_965_760_899_652_949_416_602; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 60_463_583_993_924_838_279_318_186_770_520_690_389_381_199_378_419_758_919_684_281_408_534_766_330_816; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 109_465_924_828_679_367_584_670_908_891_521_851_701_001_712_222_687_542_353_694_243_859_552_650_543_697; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 100_140_992_804_507_772_125_106_425_649_786_843_705_126_863_547_094_532_419_522_292_271_385_578_102_840; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 111_173_538_096_293_411_623_516_119_412_688_422_311_958_145_056_026_651_740_598_420_688_748_307_124_009; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 3_515_791_381_793_318_940_007_457_130_910_557_226_817_757_745_478_218_930_043_351_914_134_520_773_447; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 2_087_354_989_506_822_459_874_134_209_966_418_989_396_269_849_045_007_937_760_686_293_171_680_284_679; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 35_901_406_587_420_770_320_170_606_292_750_659_066_952_424_970_647_854_102_382_066_993_769_339_093_834; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 89_913_655_057_786_705_179_746_630_765_551_586_854_166_095_022_275_478_382_903_330_649_124_630_660_769; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 113_593_426_216_406_678_418_536_559_499_674_728_667_683_908_800_837_113_536_290_183_236_975_016_227_736; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 82_471_208_532_431_449_764_575_975_777_761_318_856_304_230_805_885_673_239_963_352_918_702_663_631_917; owner = Principal.fromText("hmwxd-ccrpr-hnoox-rio37-nft6a-anh7y-c7sli-3iqbm-kvbve-rhrhi-iae"); description = ""; },
      { token_id = 1_061_815_626_338_509_607_217_872_474_667_589_972_975_865_870_759_793_099_700_719_146_751_964_584_848; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 112_452_517_796_816_101_346_804_685_604_225_251_578_750_686_487_807_995_964_115_235_254_317_756_774_384; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 28_762_072_673_494_903_865_053_085_208_607_094_634_245_782_346_499_682_776_110_086_005_876_214_141_895; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 19_648_942_719_737_893_097_064_646_730_404_954_912_982_772_055_449_049_104_760_161_277_094_313_360_336; owner = Principal.fromText("hmwxd-ccrpr-hnoox-rio37-nft6a-anh7y-c7sli-3iqbm-kvbve-rhrhi-iae"); description = ""; },
      { token_id = 83_068_110_299_835_064_629_244_667_997_105_814_416_256_331_108_227_974_344_744_669_630_531_813_384_712; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 89_556_011_162_731_464_999_262_466_199_635_392_828_520_062_165_074_846_527_460_922_740_735_974_024_891; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 97_646_387_817_572_799_238_543_423_565_756_421_750_489_589_888_338_223_937_747_278_376_254_239_840_125; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 102_609_251_380_070_745_360_102_586_975_684_182_931_551_773_070_471_166_746_411_655_328_049_402_485_617; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 111_887_522_707_423_408_647_282_380_239_321_896_670_501_903_999_781_008_890_360_180_683_790_925_315_159; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 10_886_017_101_133_207_138_504_928_963_698_253_293_461_518_091_669_420_995_053_073_502_618_416_457_700; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 19_853_290_326_295_203_473_976_006_208_328_560_555_053_331_331_792_259_736_652_030_488_252_000_804_050; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 28_251_737_931_935_556_108_464_682_747_281_631_256_535_362_696_268_739_038_357_599_689_749_199_607_772; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 31_883_699_121_033_938_330_423_994_093_783_985_113_104_259_211_035_474_723_122_793_981_151_933_303_369; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 85_648_961_221_031_652_896_653_389_696_557_233_556_265_046_966_994_027_022_442_810_120_034_077_373_008; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 84_907_142_417_740_883_231_349_508_218_683_799_947_399_229_100_065_180_386_376_853_130_930_287_671_002; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 66_741_644_133_512_616_297_578_954_047_403_089_485_037_698_552_683_656_925_508_029_723_905_491_440_711; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 34_014_483_722_837_543_748_135_976_608_086_798_799_299_676_043_506_450_433_658_938_745_265_499_300_684; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 64_048_522_115_859_060_984_254_903_585_467_220_754_673_624_264_855_322_988_186_176_578_746_088_671_787; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 57_800_214_184_634_838_660_408_827_395_107_714_270_436_408_175_019_498_804_511_309_533_595_003_569_047; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 19_899_330_585_603_107_808_825_829_198_822_555_081_885_796_713_390_995_155_206_407_874_610_859_964_468; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 35_004_157_040_326_684_682_279_339_591_299_250_573_233_888_135_617_024_159_987_096_411_231_061_910_756; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 114_094_918_559_684_196_536_545_535_035_044_069_538_155_228_280_556_720_694_585_987_999_039_945_858_482; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 41_217_667_106_942_585_100_332_582_399_068_501_305_807_822_025_394_948_867_539_525_902_551_163_036_302; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 86_136_368_166_474_313_300_350_420_373_596_832_403_305_946_695_780_135_438_422_541_453_529_954_034_800; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 93_898_949_231_584_415_560_514_582_490_924_988_973_334_476_985_607_468_853_855_713_142_852_584_748_676; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 60_477_599_277_096_238_216_436_465_152_700_967_354_471_512_706_738_471_911_622_510_358_403_594_267_258; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 1_029_917_830_358_997_451_103_559_799_443_813_917_932_209_422_383_442_582_867_874_158_840_988_738_809; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
    ];

    let initial_nfts = Array.map<NFTData, ICRC7.SetNFTItemRequest>(
      nft_data,
      func (data: NFTData) : ICRC7.SetNFTItemRequest {
        {
          base_nft with
          token_id = data.token_id;
          owner = ?{owner = data.owner; subaccount = null;};
          metadata = #Map([("description", #Text(data.description))]);
        }
      }
    );

    let set_nft_request : ICRC7.SetNFTRequest = initial_nfts;

    switch(icrc7.set_nfts<system>(caller, set_nft_request, true)){
      case(#ok(val)) D.print("Successfully initialized NFTs: " # debug_show(val));
      case(#err(err)) D.trap("Failed to initialize NFTs: " # err);
    };
  };
}
