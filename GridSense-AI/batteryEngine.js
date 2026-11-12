/**
 * GridSense AI - Battery Storage System Engine
 */

export class BatteryStorageSystem {
    constructor(capacitykWh = 100.0, initialSoC = 50.0) {
        this.capacitykWh = capacitykWh;
        this.soc = initialSoC; // Percentage (0 - 100%)
        this.maxChargeKW = 100.0;
        this.maxDischargeKW = 100.0;
        this.essentialLoadsActive = true;
    }

    update(solarKW, essentialKW, secondaryKW, isSecondaryOn, timeStepHours) {
        let secondaryAutoShed = false;
        let alertMessage = "System nominal.";

        // Rule 1: Solar PV < 25 kW automatically sheds secondary load
        if (solarKW < 25.0 && isSecondaryOn) {
            secondaryAutoShed = true;
            alertMessage = "LOW SOLAR GENERATION (< 25 kW): Secondary load automatically shed.";
        }

        // Rule 2: Battery SoC <= 5% shuts down ALL loads (Clinic + Agri)
        if (this.soc <= 5.0) {
            this.essentialLoadsActive = false;
            alertMessage = "CRITICAL BATTERY LEVEL (≤ 5%): Essential load shed. System completely offline.";
        } else {
            this.essentialLoadsActive = true;
        }

        // Effective demand based on load availability
        const activeEssentialKW = this.essentialLoadsActive ? essentialKW : 0.0;
        const activeSecondaryKW = (isSecondaryOn && !secondaryAutoShed && this.essentialLoadsActive) ? secondaryKW : 0.0;
        const totalDemandKW = activeEssentialKW + activeSecondaryKW;

        const netPowerKW = solarKW - totalDemandKW; // Positive = Surplus, Negative = Deficit

        if (netPowerKW > 0) {
            // Charging cycle
            const effectiveChargePower = Math.min(netPowerKW, this.maxChargeKW);
            const energyAddedkWh = effectiveChargePower * timeStepHours;
            const socIncrease = (energyAddedkWh / this.capacitykWh) * 100.0;
            this.soc = Math.min(100.0, this.soc + socIncrease);
        } else if (netPowerKW < 0) {
            // Discharging cycle
            const deficitKW = Math.abs(netPowerKW);
            const effectiveDischargePower = Math.min(deficitKW, this.maxDischargeKW);
            const energyDrawnkWh = effectiveDischargePower * timeStepHours;
            const socDecrease = (energyDrawnkWh / this.capacitykWh) * 100.0;
            
            this.soc = Math.max(0.0, this.soc - socDecrease);

            if (this.soc <= 0.0) {
                alertMessage = "SYSTEM BLACKOUT: Battery fully depleted.";
            }
        }

        return {
            soc: this.soc,
            netPowerKW: netPowerKW,
            secondaryAutoShed: secondaryAutoShed,
            essentialLoadsActive: this.essentialLoadsActive,
            effectiveDemandKW: totalDemandKW,
            alertMessage: alertMessage
        };
    }
}