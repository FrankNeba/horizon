const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("Usage: node scripts/add-admin.js <username> <password>");
        process.exit(1);
    }

    const [username, password] = args;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });
        console.log(`Admin user created: ${user.username}`);
    } catch (error) {
        console.error("Error creating admin user:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
