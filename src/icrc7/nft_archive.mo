// This backup taken at 2024-10-26 8:15am EST
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
      { token_id = 104_760_760_997_850_812_903_274_874_091_411_378_481_042_309_372_675_687_061_723_475_027_336_632_625_264; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 5_528_200_941_805_882_011_263_085_729_612_334_961_717_241_120_619_514_598_663_268_166_077_984_727_675; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 57_688_227_664_656_823_408_217_570_838_027_662_246_634_472_583_627_946_654_080_995_958_141_439_481_816; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 92_498_236_458_556_963_659_257_220_274_808_634_309_811_259_643_320_033_960_778_513_661_617_725_283_932; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 109_381_606_878_996_383_609_987_987_881_713_402_148_855_896_677_405_712_652_031_342_705_383_403_888_535; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 34_074_496_671_031_294_595_903_548_613_384_999_231_958_695_020_883_571_075_349_824_073_632_141_756_860; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 92_985_219_056_012_979_480_872_088_133_912_118_595_224_932_968_957_597_265_694_644_858_775_928_652_819; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 42_633_014_445_850_907_615_455_550_778_409_779_227_799_444_111_852_149_172_965_752_262_496_025_812_709; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 97_499_075_625_722_185_859_299_534_744_690_026_913_050_372_752_015_642_042_551_430_944_827_087_802_495; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 10_591_136_123_309_554_604_736_661_377_002_878_012_373_072_871_028_776_999_333_602_806_438_613_518_684; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 110_078_052_893_264_893_023_147_293_134_743_163_057_047_298_756_422_974_648_626_634_902_845_144_434_785; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 35_142_433_015_282_918_969_778_698_632_598_638_295_367_934_410_281_044_166_636_216_698_041_693_317_317; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 2_936_983_309_648_070_782_926_960_378_720_341_810_214_395_942_671_244_080_493_509_036_529_615_573_863; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 15_224_362_162_008_050_806_137_369_670_794_663_964_011_940_861_379_063_865_267_921_961_761_958_205_435; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 115_682_997_743_667_065_168_339_554_534_798_948_223_484_642_928_923_846_076_937_146_619_236_066_841_876; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 16_696_141_146_924_767_523_833_254_470_636_978_171_451_254_164_841_077_633_718_443_085_460_735_179_886; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 99_417_908_711_237_042_397_967_070_119_394_913_218_361_549_405_217_844_958_835_235_133_302_940_638_490; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 47_797_280_039_887_117_222_179_360_507_926_359_368_840_900_596_144_169_285_846_154_524_090_281_579_747; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 52_405_352_992_511_232_142_800_906_191_735_517_590_778_526_077_797_823_324_926_403_352_474_411_540_887; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 103_009_297_847_124_570_198_113_224_224_595_738_083_974_853_798_606_414_862_095_969_682_606_778_493_415; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 96_763_858_652_524_535_508_635_107_088_102_242_117_182_492_193_979_801_274_134_361_272_064_245_819_887; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 12_752_799_928_984_911_576_241_176_541_702_251_325_456_359_392_999_381_465_377_573_230_919_370_648_773; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 15_306_606_033_170_081_137_026_999_660_663_017_941_375_303_701_493_136_517_531_917_405_393_133_726_175; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 66_833_821_898_691_561_446_691_328_319_112_708_757_460_211_474_262_045_671_423_309_803_748_137_126_956; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 12_516_773_478_246_806_134_122_066_014_049_485_528_776_172_680_210_087_821_283_225_746_560_572_640_679; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 97_424_358_363_346_601_299_990_949_062_017_754_455_825_029_639_739_203_225_776_080_256_932_967_449_219; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 27_823_109_336_043_136_178_185_559_678_019_765_849_847_238_739_975_385_431_102_201_735_975_828_676_143; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 113_252_175_837_987_678_613_575_831_818_887_906_073_198_050_559_010_486_669_683_505_566_400_821_664_840; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 54_860_953_097_476_850_338_135_618_176_990_084_387_204_774_193_990_108_544_284_923_751_027_561_152_127; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 76_834_394_477_589_964_921_183_773_803_595_896_693_129_799_919_480_631_386_622_117_865_627_071_347_427; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 9_168_272_366_857_154_571_152_604_005_409_359_782_928_619_971_162_031_766_865_956_701_610_311_323_644; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 39_922_695_682_098_588_090_251_021_838_793_209_589_243_362_887_447_355_216_604_034_525_896_448_957_266; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 54_951_706_848_655_619_277_388_388_579_680_769_469_751_697_243_653_118_472_763_902_746_430_362_852_998; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 71_148_357_861_703_521_825_919_053_406_591_242_867_058_283_930_644_072_367_370_828_203_915_077_209_767; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 91_441_029_548_968_208_335_781_795_494_712_596_230_076_979_333_489_150_310_210_003_839_215_332_296_291; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 93_216_404_576_017_722_247_836_386_049_345_263_346_230_525_810_975_352_424_879_010_500_310_649_056_724; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 39_379_636_652_997_733_761_475_212_588_921_378_273_418_267_512_224_148_275_238_517_779_536_786_712_793; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 15_080_609_881_929_507_594_849_886_031_028_004_431_731_847_270_772_750_245_904_158_473_580_317_190_504; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 43_253_609_576_608_769_187_927_688_428_959_969_993_420_206_883_427_635_352_301_555_888_379_338_393_361; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 19_105_950_676_464_513_348_937_587_528_583_825_140_703_921_290_641_531_283_444_401_863_438_994_968_618; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 56_918_818_435_840_733_130_040_421_392_449_664_363_201_400_498_518_052_537_094_730_551_076_598_569_752; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 50_371_499_168_635_593_005_195_203_365_446_102_991_850_097_931_216_510_619_156_107_828_798_697_330_256; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 45_650_721_519_264_937_576_044_930_015_078_776_157_860_559_744_739_979_707_557_925_402_938_202_324_049; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 19_607_612_343_278_754_650_907_191_034_747_163_038_405_238_514_859_208_052_733_170_380_783_721_364_746; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 80_685_692_815_905_811_939_101_098_991_326_133_883_827_203_702_654_961_951_962_192_795_898_515_718_222; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 749_324_475_870_366_506_415_686_635_625_853_703_490_132_245_785_137_460_721_264_229_871_841_011_689; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 100_203_822_287_122_277_273_029_730_880_260_363_199_036_931_515_582_474_910_184_082_007_531_700_548_858; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 10_132_295_803_882_905_138_664_313_100_995_290_125_008_726_864_818_831_724_884_202_009_905_431_769_617; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 57_796_879_091_667_361_471_388_855_585_394_857_480_801_282_947_780_674_180_691_794_140_758_032_651_086; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 19_222_462_924_429_147_590_044_675_789_275_938_356_749_340_015_637_236_252_921_123_237_820_068_911_236; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 25_198_507_710_779_596_934_980_744_209_585_971_470_869_309_071_181_336_479_485_571_538_969_242_585_353; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 100_622_462_256_049_698_203_401_481_139_060_140_309_649_581_118_582_491_430_994_729_714_627_744_474_121; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 42_822_689_815_713_760_887_074_044_015_092_111_898_072_167_008_318_580_095_904_419_771_769_240_393_727; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 80_733_537_659_214_894_469_978_324_135_673_447_847_999_203_914_104_787_107_686_799_962_304_932_388_842; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 72_067_806_455_813_227_942_081_980_478_458_807_585_428_801_888_408_378_246_996_966_232_803_562_443_253; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 103_418_820_453_969_574_915_387_372_105_852_144_882_189_194_041_891_955_278_208_347_649_949_887_684_269; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 49_262_569_534_144_136_985_453_266_012_493_083_075_715_550_886_204_559_432_710_351_873_807_223_731_130; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 73_783_730_979_111_079_871_585_995_913_719_687_344_611_427_611_148_195_486_422_831_837_201_550_459_462; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 106_313_446_429_754_684_672_408_231_714_583_996_688_119_340_806_160_670_754_148_517_890_479_561_255_608; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 67_174_314_259_997_621_381_254_614_782_722_807_862_155_962_866_127_421_376_747_032_635_026_497_410_688; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 41_552_900_218_759_268_708_414_100_412_475_495_358_479_711_635_977_503_427_181_433_222_127_233_584_451; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 23_890_759_387_605_340_007_259_684_117_170_253_585_872_872_394_790_052_451_943_637_719_315_733_098_105; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 106_012_020_507_890_128_647_959_399_475_733_296_091_669_319_558_040_042_346_147_685_003_215_965_837_159; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 61_553_628_401_594_692_344_136_531_478_183_008_926_666_005_736_993_624_515_185_228_195_027_636_000_415; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 26_562_885_193_571_670_542_787_956_670_095_423_187_866_370_939_052_455_723_413_948_319_050_577_500_661; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 79_267_656_725_206_929_421_067_359_173_680_493_763_611_434_508_640_528_351_345_576_644_307_118_682_832; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 113_506_302_222_030_721_211_236_257_060_837_069_152_971_354_721_255_395_389_421_146_202_654_238_797_929; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 107_092_423_488_862_638_828_196_055_942_537_049_462_464_166_287_012_601_491_970_783_328_478_257_764_180; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 9_122_781_721_259_371_509_735_326_881_387_590_488_624_904_498_961_869_956_851_360_092_876_201_331_089; owner = Principal.fromText("2vxsx-fae"); description = ""; },
      { token_id = 20_545_975_004_928_119_651_654_466_261_818_070_904_799_448_604_294_656_190_682_553_641_282_476_750_230; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 66_873_444_468_371_429_710_287_055_112_656_382_201_450_529_505_609_353_664_817_159_706_200_165_925_307; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 81_623_591_898_541_352_810_628_839_831_149_166_815_831_934_047_942_885_968_082_762_559_662_746_381_386; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 61_270_373_922_996_403_214_604_528_568_244_150_559_557_393_353_128_320_644_847_859_314_462_523_570_300; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 107_701_727_566_361_804_453_328_978_900_605_409_743_869_034_118_443_211_866_032_348_830_151_356_763_642; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 49_021_176_544_591_067_943_687_141_245_601_630_758_039_128_392_997_071_843_080_102_350_131_637_896_412; owner = Principal.fromText("2vxsx-fae"); description = ""; },
      { token_id = 69_049_315_588_856_803_715_945_534_615_978_923_868_853_638_488_901_958_968_732_955_514_060_711_771_001; owner = Principal.fromText("2vxsx-fae"); description = ""; },
      { token_id = 25_327_370_550_959_835_766_246_928_761_996_093_296_903_524_092_716_688_353_726_443_114_548_246_712_350; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 19_202_878_136_449_827_562_451_149_552_788_373_761_059_476_220_243_707_390_947_258_631_065_106_349_506; owner = Principal.fromText("iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae"); description = ""; },
      { token_id = 114_312_066_561_750_659_393_599_816_939_019_443_765_476_185_652_560_142_088_594_608_255_495_999_108_775; owner = Principal.fromText("2vxsx-fae"); description = ""; },
      { token_id = 1_464_537_915_487_790_390_279_452_296_280_111_260_478_553_155_192_679_429_285_997_229_678_162_145_193; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 6_420_483_624_565_566_535_681_242_902_128_338_803_468_506_282_486_590_958_456_549_101_942_993_444_452; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 17_328_516_242_700_130_357_651_493_543_126_712_350_329_362_139_218_482_322_130_274_900_709_861_809_610; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 1_553_527_143_551_660_376_016_733_201_844_413_397_307_164_595_801_293_422_121_923_545_750_490_302_906; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 97_948_025_154_998_878_976_885_098_769_286_514_032_729_616_170_753_068_018_776_272_555_969_300_354_905; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 107_738_903_657_923_562_340_613_025_445_429_756_095_348_392_038_805_147_513_214_887_449_128_560_917_621; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 36_784_212_597_717_265_839_291_857_200_795_818_221_690_414_603_932_306_605_815_730_591_999_773_045_117; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 25_572_381_725_247_748_024_648_617_678_244_640_482_528_655_876_157_040_433_775_253_185_273_512_717_626; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 27_840_613_923_548_651_681_241_654_941_551_059_647_806_089_897_626_193_784_085_569_088_508_834_615_648; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 76_496_192_355_349_301_269_898_740_615_704_921_293_793_814_761_321_997_646_076_668_603_211_048_335_764; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 49_198_310_026_141_639_816_595_629_825_119_216_978_105_422_281_010_494_258_008_212_178_937_610_780_308; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 81_688_274_078_967_425_536_271_597_388_769_797_916_445_753_850_955_855_621_955_397_666_595_928_420_227; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 15_074_880_665_817_317_397_825_057_009_940_519_207_762_442_492_602_543_318_859_695_826_578_252_629_020; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 2_009_114_434_714_497_310_922_969_003_603_374_447_398_736_983_918_037_466_270_100_858_446_303_404_159; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 18_687_181_913_686_051_806_255_520_726_327_719_865_610_886_410_277_061_276_702_707_693_068_660_271_300; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 30_296_125_770_487_207_077_425_303_699_846_936_114_607_888_703_903_829_829_298_645_306_629_745_073_642; owner = Principal.fromText("iptxv-t4s22-c4wqj-npnvl-reyuz-holr7-kxjnr-fkllw-yxxhy-s6yjf-wae"); description = ""; },
      { token_id = 15_598_673_494_001_392_502_315_253_626_813_128_277_624_081_961_378_211_296_816_177_211_368_078_140_211; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 43_959_713_190_738_627_261_261_654_172_458_938_694_660_055_992_104_229_022_892_150_904_408_279_936_494; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 47_870_945_817_768_055_881_371_350_493_934_711_925_727_918_085_019_431_948_046_343_096_000_985_242_502; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 26_415_053_733_128_311_253_337_994_156_117_719_009_511_836_798_391_578_467_848_452_139_016_962_253_272; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 93_687_803_801_330_659_249_540_171_476_566_847_690_099_357_448_666_682_632_562_342_211_308_387_244_741; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 21_821_507_006_427_642_065_224_001_646_057_793_341_883_180_760_496_987_565_261_670_071_965_733_064_598; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 114_394_170_096_175_262_322_434_515_569_392_155_608_599_325_845_878_029_787_325_322_703_379_772_408_540; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 48_118_077_564_051_467_509_453_979_947_398_973_507_505_782_870_089_816_968_165_988_334_790_895_573_641; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 53_437_493_418_477_881_424_232_797_124_831_460_405_080_414_381_551_528_481_588_961_164_284_394_149_315; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 24_249_833_046_077_720_511_792_457_258_445_793_380_032_478_688_546_322_059_018_099_116_296_169_181_395; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 78_373_337_668_620_053_153_495_708_841_913_336_572_165_445_734_051_493_810_447_092_777_898_001_992_892; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 79_406_372_389_165_001_434_522_168_977_786_145_052_242_569_860_644_050_827_229_068_552_513_426_266_909; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 97_025_766_614_554_420_211_850_187_157_888_070_224_644_569_885_676_277_724_956_638_353_187_088_955_713; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 72_748_867_858_752_526_713_796_039_491_509_383_856_104_093_095_476_076_745_133_055_472_122_437_980_670; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 59_645_226_262_107_958_381_143_948_317_546_394_264_082_310_342_044_614_961_534_935_055_776_945_428_053; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 81_660_403_293_991_969_454_811_768_005_393_363_628_927_181_307_528_301_547_873_208_276_208_211_702_955; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 114_360_980_642_853_789_670_106_229_445_439_698_824_636_740_762_872_510_564_129_692_297_945_920_272_247; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 28_386_017_800_049_691_560_950_641_217_768_319_874_433_312_905_717_068_970_267_387_229_358_740_530_506; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 109_869_815_633_781_605_217_325_701_787_513_821_263_217_821_542_135_176_741_712_847_448_058_594_939_933; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 68_735_601_184_947_163_905_976_708_175_381_218_853_936_002_056_649_089_048_612_518_404_179_210_518_815; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 3_387_902_481_003_496_313_231_349_846_874_837_459_240_548_664_392_544_337_556_036_909_599_468_915_420; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 24_909_842_358_810_095_374_360_445_701_883_367_842_890_907_381_398_308_077_171_689_050_649_606_768_848; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 10_420_184_412_155_979_589_716_897_716_654_878_771_908_770_227_119_919_209_253_974_744_518_906_284_581; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 11_320_939_156_171_152_918_562_067_220_023_594_022_155_664_040_388_427_741_473_359_721_345_096_415_910; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 55_497_061_464_955_671_247_665_571_386_481_441_088_681_160_418_023_557_651_563_485_719_126_966_360_670; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 114_834_251_862_369_500_565_087_182_682_167_727_228_931_737_706_268_490_271_795_466_107_791_181_936_697; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 46_492_467_802_848_646_612_563_198_185_741_519_299_575_760_821_152_300_378_439_765_009_867_543_856_224; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
      { token_id = 16_928_526_199_065_266_065_050_902_648_090_505_749_571_558_712_922_137_796_585_220_263_164_205_657_492; owner = Principal.fromText("7ua4j-6yl27-53cku-vh62o-z5cop-gdg7q-vhqet-hwlbt-ewfja-xbokg-2qe"); description = ""; },
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
