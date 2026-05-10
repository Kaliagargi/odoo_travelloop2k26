import { PrismaClient } from "../app/generated/prisma";
const prisma = new PrismaClient()

async function main() {
  await prisma.city.deleteMany()
  await prisma.city.createMany({ data: [
    { name: "Paris",     country: "France",    region: "Europe",      costPerDay: 8000,  description: "City of love and lights",        imageUrl: "https://source.unsplash.com/800x500/?paris" },
    { name: "Tokyo",     country: "Japan",     region: "Asia",        costPerDay: 9000,  description: "Ultramodern meets traditional",  imageUrl: "https://source.unsplash.com/800x500/?tokyo" },
    { name: "Bali",      country: "Indonesia", region: "Asia",        costPerDay: 4000,  description: "Island of the Gods",             imageUrl: "https://source.unsplash.com/800x500/?bali" },
    { name: "New York",  country: "USA",       region: "Americas",    costPerDay: 12000, description: "The city that never sleeps",     imageUrl: "https://source.unsplash.com/800x500/?new-york" },
    { name: "Rome",      country: "Italy",     region: "Europe",      costPerDay: 7000,  description: "The Eternal City",               imageUrl: "https://source.unsplash.com/800x500/?rome" },
    { name: "Dubai",     country: "UAE",       region: "Middle East", costPerDay: 11000, description: "Futuristic skyline and desert",  imageUrl: "https://source.unsplash.com/800x500/?dubai" },
    { name: "Bangkok",   country: "Thailand",  region: "Asia",        costPerDay: 3500,  description: "Vibrant street life and food",   imageUrl: "https://source.unsplash.com/800x500/?bangkok" },
    { name: "London",    country: "UK",        region: "Europe",      costPerDay: 10000, description: "Historic capital on the Thames", imageUrl: "https://source.unsplash.com/800x500/?london" },
    { name: "Singapore", country: "Singapore", region: "Asia",        costPerDay: 9500,  description: "Garden city of Asia",            imageUrl: "https://source.unsplash.com/800x500/?singapore" },
    { name: "Barcelona", country: "Spain",     region: "Europe",      costPerDay: 6500,  description: "Gaudí and Mediterranean beaches", imageUrl: "https://source.unsplash.com/800x500/?barcelona" },
    { name: "Istanbul",  country: "Turkey",    region: "Europe",      costPerDay: 5000,  description: "Where East meets West",          imageUrl: "https://source.unsplash.com/800x500/?istanbul" },
    { name: "Sydney",    country: "Australia", region: "Oceania",     costPerDay: 10500, description: "Opera House and Bondi Beach",    imageUrl: "https://source.unsplash.com/800x500/?sydney" },
    { name: "Goa",       country: "India",     region: "Asia",        costPerDay: 2500,  description: "India's beach paradise",         imageUrl: "https://source.unsplash.com/800x500/?goa,beach" },
    { name: "Manali",    country: "India",     region: "Asia",        costPerDay: 2000,  description: "Himalayan snow and adventure",   imageUrl: "https://source.unsplash.com/800x500/?manali,mountains" },
    { name: "Maldives",  country: "Maldives",  region: "Asia",        costPerDay: 15000, description: "Overwater bungalows and lagoons", imageUrl: "https://source.unsplash.com/800x500/?maldives" },
  ]})
  console.log("15 cities seeded")
}

main().catch(console.error).finally(() => prisma.$disconnect())