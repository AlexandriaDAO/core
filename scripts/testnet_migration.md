(1) Make all new canisters at this root subnet: (nl6hn-ja4yw-wvmpy-3z2jx-ymc34-pisx3-3cp5z-3oj4a-qzzny-jbsv3-4qe)


uxyan-oyaaa-aaaap-qhezq-cai

// Did this for every canister of ours.
dfx canister stop vetkd --network ic
dfx canister delete vetkd --network ic
dfx canister create vetkd --next-to uxyan-oyaaa-aaaap-qhezq-cai --network ic  --with-cycles 10000000000000
dfx canister update-settings vetkd --add-controller yog5q-6fxnl-g4zd4-s2nuh-f7fkw-ijb4e-z7dmo-jrarx-uoe2x-wx5sh-dae --network ic


(2) Add nns as a controller: yog5q-6fxnl-g4zd4-s2nuh-f7fkw-ijb4e-z7dmo-jrarx-uoe2x-wx5sh-dae

(3) Register the new subdomain: 

curl -sL -X POST \
    -H 'Content-Type: application/json' \
    https://icp0.io/registrations \
    --data @- <<EOF
{
    "name": "lbry.app"
}
EOF