import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/DB/Connection";
import { CustomerModel } from "../src/customer/Customer-Module";
import { HealthProfileModel } from "../src/health-profile/HealthProfile-Modul";

async function main() {
    await connectDB();
    
    try {
        console.log("Fetching all customers in database...");
        const customers = await CustomerModel.find({});
        console.log(`Found ${customers.length} customers.`);

        let updatedCount = 0;

        for (const customer of customers) {
            console.log(`Updating health profile for: ${customer.firstName} ${customer.lastName} (${customer.email})...`);
            
            // Delete existing health profile if any
            await HealthProfileModel.deleteMany({ customerId: customer._id });

            // Create new high-risk, critical health profile
            await HealthProfileModel.create({
                customerId: customer._id,
                age: 89,
                sex: "female",
                weightKg: 42,
                heightCm: 165,
                pregnant: true,
                
                allergies: [
                    { allergen: "Peanuts", severity: "severe" },
                    { allergen: "Gluten", severity: "severe" },
                    { allergen: "Dairy", severity: "severe" },
                    { allergen: "Fish", severity: "severe" },
                    { allergen: "Shellfish", severity: "severe" },
                    { allergen: "Soy", severity: "moderate" },
                    { allergen: "Eggs", severity: "severe" },
                    { allergen: "Wheat", severity: "severe" }
                ],
                
                conditions: [
                    { name: "Heart Failure", icd10: "I50.9", severity: "critical" },
                    { name: "Chronic Kidney Disease Stage 5 (ESRD)", icd10: "N18.6", severity: "critical" },
                    { name: "Cirrhosis of Liver", icd10: "K74.6", severity: "critical" },
                    { name: "Type 2 Diabetes Mellitus", icd10: "E11.9", severity: "severe" },
                    { name: "Severe Hypertension", icd10: "I10", severity: "severe" },
                    { name: "Asthma", icd10: "J45.9", severity: "severe" },
                    { name: "Active Peptic Ulcer", icd10: "K27.9", severity: "severe" }
                ],
                
                medications: [
                    { name: "Warfarin", doseMg: 5, frequencyPerDay: 1 },
                    { name: "Lisinopril", doseMg: 40, frequencyPerDay: 1 },
                    { name: "Metformin", doseMg: 1000, frequencyPerDay: 2 },
                    { name: "Furosemide", doseMg: 80, frequencyPerDay: 2 },
                    { name: "Aspirin", doseMg: 325, frequencyPerDay: 1 },
                    { name: "Atorvastatin", doseMg: 80, frequencyPerDay: 1 },
                    { name: "Insulin Glargine", doseMg: 50, frequencyPerDay: 1 }
                ],
                
                dietaryRestrictions: [
                    "sodium-restriction", 
                    "low-protein", 
                    "diabetic", 
                    "gluten-free", 
                    "dairy-free", 
                    "peanut-free", 
                    "low-potassium"
                ],
                
                riskFactors: {
                    hypertension: true,
                    kidneyDisease: true,
                    liverDisease: true
                }
            });

            updatedCount++;
        }

        console.log("\n==================================================");
        console.log(`SUCCESS: Updated ${updatedCount} customers with critical health profiles! ✅`);
        console.log("==================================================");

    } catch (err) {
        console.error("Error setting health profiles:", err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
