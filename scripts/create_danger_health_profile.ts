import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../src/DB/Connection";
import { CustomerModel } from "../src/customer/Customer-Module";
import { HealthProfileModel } from "../src/health-profile/HealthProfile-Modul";
import { generateToken } from "../src/utils/jwt.utils";
import bcrypt from "bcrypt";

async function main() {
    await connectDB();
    
    try {
        const email = "danger@example.com";
        console.log(`Checking if customer exists with email: ${email}...`);

        let customer = await CustomerModel.findOne({ email });

        if (!customer) {
            console.log("Customer not found. Creating customer 'Danger User'...");
            const hashedPassword = await bcrypt.hash("Password123!", 10);
            
            // Insert customer directly
            const result = await CustomerModel.collection.insertOne({
                firstName: "Danger",
                lastName: "User",
                email,
                phone: "+201009999999",
                password: hashedPassword,
                address: {
                    street: "99 Intensive Care Unit Rd",
                    city: "Cairo",
                    state: "Cairo",
                    postalCode: "11511",
                    country: "Egypt",
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            
            customer = await CustomerModel.findById(result.insertedId);
            console.log(`Created new customer: ${customer?._id}`);
        } else {
            console.log(`Found existing customer: ${customer._id}`);
        }

        if (!customer) {
            throw new Error("Failed to find or create customer!");
        }

        // Delete existing health profile if any
        await HealthProfileModel.deleteMany({ customerId: customer._id });
        console.log("Cleared existing health profile.");

        // Create new high-risk, "near death" health profile
        const healthProfile = await HealthProfileModel.create({
            customerId: customer._id,
            age: 89,
            sex: "female", // female to allow testing pregnancy interaction warnings too
            weightKg: 42,   // severely underweight
            heightCm: 165,
            pregnant: true, // critical warning flags for pregnancy interactions
            
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
                { name: "Warfarin", doseMg: 5, frequencyPerDay: 1 }, // blood thinner
                { name: "Lisinopril", doseMg: 40, frequencyPerDay: 1 }, // ACE inhibitor
                { name: "Metformin", doseMg: 1000, frequencyPerDay: 2 }, // Diabetes medication
                { name: "Furosemide", doseMg: 80, frequencyPerDay: 2 }, // Strong diuretic
                { name: "Aspirin", doseMg: 325, frequencyPerDay: 1 }, // High dose NSAID
                { name: "Atorvastatin", doseMg: 80, frequencyPerDay: 1 }, // Statin
                { name: "Insulin Glargine", doseMg: 50, frequencyPerDay: 1 } // Insulin
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

        console.log("\n==================================================");
        console.log("     HEALTH PROFILE CREATED SUCCESSFULLY ✅       ");
        console.log("==================================================");
        console.log(`Customer Name:     ${customer.firstName} ${customer.lastName}`);
        console.log(`Customer Email:    ${customer.email}`);
        console.log(`Customer Password: Password123!`);
        console.log(`Customer ID:       ${customer._id.toString()}`);
        console.log(`Profile ID:        ${healthProfile._id.toString()}`);
        
        // Generate JWT token
        const token = generateToken(customer._id, customer.email, "customer");
        console.log("\n🔑 Test JWT Token for danger@example.com:\n", token);
        console.log("==================================================");

    } catch (err) {
        console.error("Error creating health profile:", err);
    } finally {
        await mongoose.connection.close();
    }
}

main();
