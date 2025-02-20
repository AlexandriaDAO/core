import React, { useEffect } from "react";
import { useAppSelector } from "@/store/hooks/useAppSelector";
import WalletItem from "./components/WalletItem";
import NoWallet from "./components/NoWallet";
import { LoaderCircle } from "lucide-react";

function Wallets() {
	const { wallets, loading } = useAppSelector((state) => state.wallets);

	// useEffect(()=>{
	// 	const arweave = Arweave.init({});
	// 	// arweave.wallets.generate().then((key) => {
	// 	// 	console.log(key);
	// 	// 	// choice truck indoor steel devote space transfer bunker add embody rapid custom
	// 	// 	// {"d":"fOLmItsyLe1Q282vgGE0lpVD3GDbf9J9rANUyWHyqQSpk-KLXhj_ZL0kG7egKQRicr1oddlFSJWN_E1ejT6DThGWpcnRr4VmYtrHFYemFPDMUc_7hEz41aOpjlFEiKcQ1W_xE-PbfItno1RsZC260597TCSt8oZk-lvu-3DIRuzNc3lXa8J9BfWKrtPHrfF-9Q7nkoN2MS2OhLrdSDP0aWbMMdIRDZvor-gQoliMJkJ7X6CDOtQpXf302KF2qxXjbRECaARLZOsds_13q0sdQ6nD0mWkNZ4MILTQtYiezn6GhdHByqGaIfiolo9d86ERWQYT4y5MkBtUnv6WjObEaQoLgPn3wSjeTADXWgl704l3SiMgvxJLbhUpojpaFOOmu76Ymz-uHWAIEy8PrTmUyuHkk9m2avbXkqGkQPdXdl1ZoucmyIfhzZ_ZZnKm7KjEJ1iVQfFwuLlRh9TchxAH7L1wrnEMoX-Q4hVeDHx5_NbDZkPFnW4qEszED3_vEja-YOjQdzTkFhAiMC4fkVaQ5ErgBSMZidbroiyWIZGfgaD_8WGyLabvKL1uOE4Wr0vmolHXmO8yFfkkT8fxPXYa7Dx5NDldUO33i2-KE0FkIW8pMbMKjLmWNGp9TQHxgvMkE4sjKw8iMrsjihk7S978B2fi4X_kAP877dzAYACffiE","dp":"RcxnIN49Nqw7Doetd5sTlyw4HLIMorTHyEjp99XJ_aYes88pynUYgWPwITxRbMXXSjhH32zxQI38YNDmpMMBuL5WCkcY41ys7SAouYHcQjr0Cw6lIdXONFD2uG9QiuZV8ps17gM6zDY7oexJXR9OiL8fRDYgVlFjz8raXNR2xo21V-slk8y9VH0g24hcmBKA7vLGhK3o9l9vBe1hddWdNe7475XcGyGew7WeAnfDbfxOKXnGLnkkj69C_2jcEpK1oDhesEOsggBLy2r0T9Q8ZURA-v0v-z6dcrNdHKjvGNSoIIp2vFFhJoT29YmgAXeG3UZpZoIisjSH6MS0KljMgw","dq":"QXidLVh-XCcj4L24XVOLWibsOytWn5shU9b9GZQQfVIg1OonphIQyQl6Jx0QymMStVir-_thOkgwaGlQIJW86v1KZ9sIo_1wa6hoHUPn79Man_LL6S6R5oCf4N5-ujQYfHvFT69m1GgqtiTm1x1hcTVeVs7XQM1YDAH_pYMzv0mOWhB__BKy3Hd5I07Sw_mcwrqW2vfDJmzya785JuM7uJsVXyR-O-fpSuE0fIFPlBTg7D-TIamEvQET750RlMEUa7-PkuAv3Ts9vBzWAi3ikOF0RyhJprl1BYkEY4WitiGP45QbW2ydh9Wt4C_HZtvFgMwKvsHCznUwXxaeWNtHIQ","e":"AQAB","ext":true,"kty":"RSA","n":"hnPlnT7s-JaDzVxbMuFHhCq8upJdT_ygCOLThKiR2yQVvGCnaV0jpNiIFzInNsPea5t8xXWnvqSglkxuw72xAhB8-2sGgdei18alecZeEazBSqFkb0tBn65yAi6OtLrcZi2HqEd0prs5vCRMxsX4N588yIwiCyvGtWzVS7Ac5fkaznJh6BIjEzIjuw75L6KpGg5eSoymDIxB6rFb4l2Qgw3TX_OhoRitt1m8vY0VyZOGL8XgX2BHiN3Jz8PpAdPWQtnaz8rKa3eWbHZfVNW0UHh5b6BHcDfa631vuxIPOEhJbYkE2svhopnpcFwiXMRli05RItJR3TqvcUx8bW4lKfv2s2FCI-Nf-LXD6zAEXREqnHMzTwUMTJa7amVTGzHashJmHN09haYbDXWM9wStRIROkUAhaaLNRSj6qT9AKiqsBZ9_-m56hT631k0AXUMR3Yv-xufIMWh3E3_shYYoqT4qPWVIdbwlkqujKUK9vBjoEg-i45GWkwfROyOPmrP6r40Jcy94Ypj7_D-j9eMBq8qzmw2gJYJlSZrfo3dU0qzH6behoy4AM31QhbS4Wtdnqd6LVZ_SH4ieNtC-coqUSYP69OIcn2aQ9WeOhRmMGKjBEbxK0ZtVGwKrwY_oECyP3-q9lHyl14-1X4YjpcEwKHjXNqM75mUk2Ombn3roO0M","p":"7LU7gm-KpJMQy0yv9v_KZ9QCm8m0Xn87RLIEillxKZWGSOkC0Q0CFhNVmuCt7BfYeLOogygv-WtagGGY7uS0Q1lV45Y5ZHkwLVHFtVjfIpqtOBWECkQC1iQ0bIwPqTCxvEUNCcCBEn5Lsii2THHQfyQZNrBul7O5mBlAQebnoCaFa3Qha_RpF5lhH4fuGH7C79kSrzYwaJqxBpAKbaWrL6b27uHOSJcl3VL9Qkx1-aoU0k9YdD9cfSf5utJiJ0ZU2L-yiherZlgrf-ka_qSO7fPsA2uDUvlzrYIEh-Ol4-LsDXC8hDUdIQbJ8f4Ii6vOTrsp8HEX1gXiGvPkKyUyKw","q":"kWkr4YLTYNU2Tu1f1wP_JawBi4jqrvwn9-Hi7JyGqFRhXeVjWuaNnOjPzay2mXzeckURxfjTu-0TZ2S-8wmXRjjjsVePABZi-x03rV-mgAJPxdD6GbOK43Y3mzXAJ07DYT0Oo8ReSO-T_caTc2waXJNpfzq8A8mpz5K4Dr0R5LNSYV14szoMRwV_NWggFt9ILx7LeVetQO3bo0oQFeaNEGdlUNaTxDntxU4cFtCqpOAVG97RrtYrb0WWKdwgxmHfAVGLfYRGWqt0suD1r1Dc-Xnik98_dlPfpgjC_214jeaUo_gUH5Q481yIFaJMwABihnNhtjE4vYt1gUIEOqlHSQ","qi":"Y3QJvbaWZlUUsh2VA671apUQSFJAAGqfM7jUg9xkDxLvhxVH6y3dVSB70I186dbSCp2r3f1nuiIPL9gj_1qkBhO0FdSgeSM8tvFCedIo0zbokBRQfsBjL9Ka0JgKuge9xpg2vojt0dcOMmCHlZ0E5Nh6O2VSlFwxUxnfrHVG--Bss-wQhZI_UnHv0Li3q3wuUKcXhaCREKzUAHY2TLjOb8Ti80HYexwRptKk26okF5W_jAuzxjMPjFONIYXUb5vpUNN1cmbRseO1CgBI45B4dzsXBycXizUSvtEiZxoWkb1lkjT0s7wAsE4MMbTMapbNjm7VGZG8mQ0hZIwEM9Iv-Q"}
	//  //  // aM_En04Yp5oA8TuRDHiEZ8ciEiP9y7dplbsOIN24OD4

	// 	// });
	// 	arweave.wallets.generate().then((key) => {
	// 		const privateKey = key; // This is the private key
	// 		console.log('Private Key:', privateKey);

	// 		// Derive the wallet address from the private key
	// 		arweave.wallets.jwkToAddress(key).then((address) => {
	// 			console.log('Wallet Address:', address);

	// 			// Send the private key and address to the backend
	// 			console.log({ privateKey, address });
	// 		});
	// 	  });
	// }, []);

	if(loading) return (
		<div className="flex justify-start items-center gap-1">
			<span>Loading Wallets</span>
			<LoaderCircle size={20} className="animate animate-spin" />
		</div>
	)

	if(wallets.length<=0) return <NoWallet />

	return (
		<div className="w-full flex gap-2 flex-col">
			<div className="flex justify-between items-center">
				<div className="font-syne font-medium text-xl">
					Created Wallets
				</div>
			</div>
			<div className="flex gap-4 justify-start items-center">
				{wallets.map((wallet) => (
					<WalletItem key={wallet.id} wallet={wallet} />
				))}
			</div>
		</div>
	);
}

export default Wallets;