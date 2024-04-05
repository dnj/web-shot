import { z } from "zod";

const requestSchema = z.object({
    count: z.number({ coerce: true }).max(500).positive().int(),
});

export default defineEventHandler(async (event) => {

    assertMethod(event, "GET", false);

    const query = await getValidatedQuery(event, requestSchema.parse);

    const shots = await usePrisma().shot.findMany({
        where: {
            status: "AVAILABLE"
        },
        orderBy: {
            id: "desc"
        },
        take: query.count
    });

    return shots.map((shot) => {
        return {
            id: shot.id,
            url: shot.url,
        }
    });
})