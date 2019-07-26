/**
 * LOGIC FOR SMART GRID:
 *
 *	2 kinds of Energies:
 *		1 - Energy Consumed (Ec) => ∑ house... + battery
 *		2 - Energy Produced (Ep) => ∑ solar_panel... + battery
 *
 *	Payed logic:
 *		STEP 1 how does it works:
 *		if Ec < Ep {
 *			Consummer pays just what he needs & update Ep (Ep -= Ec)
 *			(the other part of electricity goes on power grid for who wants)
 *		}
 *		else if Ec > Ep {
 *			Consummer pays just what he gets & update Ec (Ec -= Ep)
 *			(the other part of electricity comes from power plant as usal)
 *		}
 *
 *		STEP 2 alias battery:
 *		if full charged -> give it to GRID (when there are not enough energy on grid)
 *		if not full & nobody wants Energy -> charge it
 *		if charge lower than ??? (ex: 30%) =>
 *			- Charge it (if nobody wants energy)
 *			- Sell it (if someone wants energy but there are not enough on grid)
 *
 *		STEP 3 how to split the payd:
 *		if all of produced energy is consumed -> each part has value of there production by the rate
 *		if a part of energy is consumed -> find a fair rate to payed each part
 *			ex:	P1	->	Ep1
 *				P2	->	Ep2
 *				C	->	Ec
 *				so C give X tokens (X = Ec * rate) => rate = tokens/Wh
 *
 *				P1 pay => Ep1 / (Ep1 + Ep2) * X
 *				P2 pay => Ep2 / (Ep1 + Ep2) * X
 *
 *			Problems:
 *				- have to do some kind of pool to pay every producer (need to know them)
 *				- 
 *
 *
 */
