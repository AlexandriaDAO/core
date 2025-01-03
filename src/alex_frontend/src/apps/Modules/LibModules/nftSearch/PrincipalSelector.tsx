import React, { useState } from "react";
import { RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { togglePrincipalSelection } from '../../shared/state/librarySearch/libraryThunks';
import { ToggleGroup, ToggleGroupItem } from "@/lib/components/toggle-group";
import { Plus, Minus } from "lucide-react";
import { Input } from "@/lib/components/input";
import { Principal } from "@dfinity/principal";

interface PrincipalData {
  principal: string;
  username: string;
}

const defaultPrincipals: PrincipalData[] = [
  { principal: "2vzlz-brder-4yk63-anmay-rkumb-5veai-jryge-auukb-6ezpr-tin6w-cae", username: "aaaaa-aa" },
  { principal: "h5phy-vqecj-p7lma-ayve3-ddp55-v4mdb-ldw7h-4nfrq-34fnr-6kukp-eqe", username: "aadii-shah-1" },
  { principal: "njg2f-gcj4d-vgqhk-nuqlr-qxhkl-7skif-taj3o-q44pk-woeiv-a5hkn-xae", username: "adill323" },
  { principal: "eqxnd-zho7f-idx4w-t742j-5anps-gzr6c-alfce-l7vhl-5b3n7-hc5c3-lae", username: "adill3233" },
  { principal: "o5x3s-fa6n3-j5rfh-wjqou-3v7fy-ql3q3-nykfh-xck7g-nbsmm-43d74-3qe", username: "anonymous" },
  { principal: "skgpp-z4g42-h3rcp-pmdbq-z32op-wrrvh-rjrq6-uqqok-wcymx-moc7j-tae", username: "capybara" },
  { principal: "2ljyd-77i5g-ix222-szy7a-ru4cu-ns4j7-kxc2z-oazam-igx3u-uwee6-yqe", username: "chadthechad" },
  { principal: "natns-ramsn-vlwsl-zeysw-4euz7-m5j53-bci2u-cclkg-2dqur-elpkk-hqe", username: "cholo1510" },
  { principal: "vg73m-a56hd-4p6ls-jfemc-hbea2-dxjfu-ag265-vp5xa-ugm7h-xwhyu-7ae", username: "cloudedlogic" },
  { principal: "cuk5i-7eksk-grcri-hsugn-auujp-rn66j-bb6bk-zkd2k-oh3nb-b76k3-iqe", username: "cryotonurse" },
  { principal: "n3br6-rkkdh-5jcq7-pbwsx-yeqm7-jbzqi-54j4d-3isk3-js4sp-vqct5-rae", username: "donghammer3000" },
  { principal: "jxvnf-l6vtv-squhr-h2esh-zlorf-b5jgw-47im2-o2qi6-7vdja-ngnqe-gae", username: "donovan5" },
  { principal: "7kq53-u5bs2-oc7qh-63fvm-65iif-hko6l-7ssjt-3mhhs-ay6nf-6rmsu-5qe", username: "drewb7" },
  { principal: "5fn2h-jpesc-bze2e-gj22e-xvxtc-kqpjm-hwlho-jnho4-bitlb-svwag-mqe", username: "eerikp" },
  { principal: "tdzba-ydjns-745a7-c5jgy-dghly-b7peg-yaolt-enudk-3e7f3-fq62d-rqe", username: "engineergod" },
  { principal: "o6njh-zp7zm-ag3ht-5377y-bvvwd-nqdwq-w5srh-xghlb-lpk7m-ykeof-dqe", username: "ilbert" },
  { principal: "wnfyr-cckbi-nvrt4-jrahv-egkqm-fyc2v-3haz5-3offb-vgd2h-4wr4d-xae", username: "icpninja" },
  { principal: "xtj2l-n4upn-gugxo-5ljex-daew7-sih4s-cqfna-tk4ia-c3cc4-3a2xp-fqe", username: "jm5555" },
  { principal: "35ec5-pwhhd-x5f5c-pd3t3-y2oec-bs2a2-lztav-joc3b-4uhkw-5mbgu-cqe", username: "joemste" },
  { principal: "6wqqm-onjy2-wlxcy-tztqo-7ha7d-xg5cb-2iij4-nnell-xzbm3-yq555-qqe", username: "kang21" },
  { principal: "shdrz-sn2bh-jgski-fn6fj-urnjc-mikll-47hui-o473u-4lgma-krexn-7ae", username: "lmcfaland127" },
  { principal: "7j252-qctk3-qasf2-dmw2s-n674v-kjfst-niqcp-2yvu4-qeefd-zu4fm-2ae", username: "lmcfarland127" },
  { principal: "uiwhs-mrph5-4mzj2-hzu6d-m5sne-mrdzr-refcb-7lehx-57wsj-gllps-2qe", username: "lorddrilonious" },
  { principal: "e2mqm-f5kv2-wacvn-7sjl2-4wmrn-zumo5-l4g2v-ac752-2vgow-tnd7c-qae", username: "marcorubio" },
  { principal: "hlmbu-xmzcn-l526t-yyfet-xf2ix-hyo66-ter6l-pu2ad-6flhh-icaxp-iae", username: "neliavosh" },
  { principal: "jmrri-uk6nh-zq62l-547lt-ewdab-l64fz-zpsrc-d6y6l-zv3jr-n7mso-oqe", username: "philosopher" },
  { principal: "t7q64-j5eyy-nrbej-h3avi-cch7s-la6wl-xs432-uuqga-l5y4t-b26t4-oae", username: "reddead" },
  { principal: "yshkh-urigw-n2o44-nh27v-63lw4-tsura-tgmsp-suuel-wjkaw-z7vmo-hae", username: "retardio" },
  { principal: "nixig-flniw-flb7m-uvuxw-b62zk-mwxku-ozffc-arwb4-tyvjl-rp23u-oqe", username: "robinet" },
  { principal: "5kaiw-kugpj-ldz5y-o4izz-aptxb-6u3jc-4pbsg-yvphr-i5x5z-7rhc4-4ae", username: "seb_icp" },
  { principal: "5hydi-doxtn-oiby3-64fwy-qwhct-2lqvy-5apbh-4ia6p-m5ivz-grl5c-iqe", username: "skilesare" },
  { principal: "x6yaw-swizz-owuk6-ozbor-7xazl-kimgb-pylt4-p6obl-vsvkf-a6wfp-mqe", username: "space_gorilla" },
  { principal: "cin6n-lhr4e-poctw-b4e4c-r6xn2-mcjlh-d4apr-25y4i-amfn3-vflwz-aae", username: "tufnel" },
  { principal: "2zf7e-ctv4z-lbpwc-an3f4-u53uo-wcam7-pur4v-2clio-s7isj-eehzy-mqe", username: "urmom_dotcom" },
  { principal: "fjn2f-o7ad2-6bfel-bjypx-azkct-o5aiv-qxucg-fymor-wtlmk-63adm-wae", username: "weebo9" },
  { principal: "cyjnt-wuusv-yc2zj-i2jnp-w3uua-z6hhf-nmswa-x3jml-vhggn-vx36c-2qe", username: "zeeshan" },
];

interface PrincipalItemProps {
  principalId: string;
  isSelected: boolean;
  label: string;
  username?: string;
  onSelect: (principalId: string) => void;
}

const PrincipalItem: React.FC<PrincipalItemProps> = ({
  principalId,
  isSelected,
  label,
  username,
  onSelect,
}) => (
  <ToggleGroupItem
    value={principalId}
    aria-pressed={isSelected}
    onClick={() => onSelect(principalId)}
    className={`px-4 py-2 text-sm font-medium rounded-[30px] transition-colors ${
      isSelected
        ? 'bg-[#2D55FF] text-white hover:bg-[#2D55FF]/90'
        : 'bg-[#F3F3F3] text-black hover:bg-[#E5E5E5]'
    }`}
  >
    {username || label}
  </ToggleGroupItem>
);

export default function PrincipalSelector() {
  const userPrincipal = useSelector((state: RootState) => state.auth.user?.principal.toString());
  const selectedPrincipals = useSelector((state: RootState) => state.library.selectedPrincipals);
  const dispatch = useDispatch<AppDispatch>();
  const [showAllPrincipals, setShowAllPrincipals] = useState(false);
  const [customPrincipal, setCustomPrincipal] = useState("");
  const [inputError, setInputError] = useState("");

  const handlePrincipalSelect = (principalId: string) => {
    dispatch(togglePrincipalSelection(principalId));
  };

  const validateAndSetCustomPrincipal = (value: string) => {
    setCustomPrincipal(value);
    setInputError("");
    
    if (value.trim() === "") return;
    
    try {
      Principal.fromText(value);
    } catch (error) {
      setInputError("Invalid principal format");
    }
  };

  const handleCustomPrincipalSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !inputError && customPrincipal.trim()) {
      handlePrincipalSelect(customPrincipal);
      setCustomPrincipal("");
    }
  };

  const visiblePrincipals = showAllPrincipals 
    ? defaultPrincipals 
    : defaultPrincipals.slice(0, 3);

  return (
    <div className="flex-1">
      <span className="block mb-2 text-lg font-medium font-['Syne'] text-foreground">
        Select Library
      </span>
      <div className="p-[14px] rounded-2xl border border-input bg-background">
        <div className="flex items-center justify-between mb-3">
          <Input
            type="text"
            placeholder="Enter principal ID..."
            value={customPrincipal}
            onChange={(e) => validateAndSetCustomPrincipal(e.target.value)}
            onKeyPress={handleCustomPrincipalSubmit}
            className={`max-w-md ${inputError ? 'border-red-500' : ''}`}
          />
          {inputError && (
            <span className="text-xs text-red-500 mt-1">{inputError}</span>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setShowAllPrincipals(!showAllPrincipals)}
            className="inline-flex items-center justify-center p-1 rounded-full hover:bg-gray-100"
          >
            {showAllPrincipals ? (
              <Minus className="h-4 w-4 text-gray-600" />
            ) : (
              <Plus className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
        
        <div className="relative">
          <ToggleGroup type="single" className="flex flex-wrap gap-2">
            {userPrincipal && (
              <PrincipalItem
                principalId={userPrincipal}
                isSelected={selectedPrincipals[0] === userPrincipal}
                label="My Library"
                onSelect={handlePrincipalSelect}
              />
            )}
            {visiblePrincipals.map((principal) => (
              <PrincipalItem
                key={principal.principal}
                principalId={principal.principal}
                isSelected={selectedPrincipals[0] === principal.principal}
                label={`${principal.principal.slice(0, 8)}...`}
                username={principal.username}
                onSelect={handlePrincipalSelect}
              />
            ))}
          </ToggleGroup>
          
          {!showAllPrincipals && defaultPrincipals.length > 3 && (
            <span className="mt-2 text-sm text-gray-500">
              +{defaultPrincipals.length - 3} more libraries
            </span>
          )}
        </div>
      </div>
    </div>
  );
} 