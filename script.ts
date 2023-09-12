import { Prisma, PrismaClient } from '@prisma/client';
import { enhance } from '@zenstackhq/runtime';

const prisma = new PrismaClient();
const enhanced = enhance(prisma);

// A `main` function so that we can use async/await
async function main() {
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
        data: { email: 'user1@abc.com' },
    });

    try {
        await enhanced.user.update({
            where: { id: user.id },
            data: { deleted: true },
        });
    } catch (err) {
        if (
            err instanceof Prisma.PrismaClientKnownRequestError &&
            err.code === 'P2004' &&
            err.meta?.reason === 'RESULT_NOT_READABLE'
        ) {
            console.error('Update succeeded but result not readable');
        }
    }

    console.log(await prisma.user.findUnique({ where: { id: user.id } }));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
