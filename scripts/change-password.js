const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log("Usage: node scripts/change-password.js <username> <new-password>");
        process.exit(1);
    }

    const [username, newPassword] = args;
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
        const user = await prisma.user.update({
            where: { username },
            data: { password: hashedPassword },
        });
        console.log(`Password updated for user: ${user.username}`);
    } catch (error) {
        console.error("Error updating password:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
