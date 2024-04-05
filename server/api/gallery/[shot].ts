import { z } from "zod";
import { resizeShot, sendShot } from "../../routes/capture";
import { Shot } from "@prisma/client";

const requestSchema = z.object({
    width: z.number({ coerce: true }).positive().int().optional(),
    height: z.number({ coerce: true }).positive().int().optional(),
});

function sendNotfound(): Promise<never> {
    return Promise.reject(createError({
        statusMessage: "Cannot find shot",
        status: 404
    }));
}

export default defineEventHandler(async (event) => {
    assertMethod(event, "GET", false);

    const shotIdString = getRouterParam(event, "shot")!;
    if (!/^\d+$/.test(shotIdString)) {
        return sendNotfound();
    }
    const shotId = parseInt(shotIdString);
    const query = await getValidatedQuery(event, requestSchema.parse);
    let shot: Shot;
    try {
        shot = await usePrisma().shot.findUniqueOrThrow({
            where: {
                id: shotId,
                status: "AVAILABLE"
            }
        });
    } catch (e) {
        return sendNotfound();
    }

    return sendShot(event, shot, query);
})