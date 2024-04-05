import type { EventHandler, EventHandlerRequest, EventHandlerResponse, H3Event } from "h3";
import { H3Error } from "h3";
import { satori } from 'v-satori';
import SegoeUI from '@/assets/fonts/segoe-ui/Segoe UI.ttf'
import ErrorImage from '@/components/ErrorImage.vue'
import { NavigationError } from "./browser";
import sharp from "sharp";


export async function generateErrorImage(title: string, description: string, width: number, height: number, format: "png" | "jpeg"): Promise<Buffer> {
    const base = { width: 350, height: 160 };

    let imageWidth = width;
    let imageHeight = height;

    if (width < base.width || height < base.height) {
        const scaleWidth = width / base.width; // 1.02
        const scaleHeight = height / base.height; // 2        
        if (scaleWidth < scaleHeight) {
            imageWidth = base.width;
            imageHeight = height / scaleWidth;
        } else {
            imageWidth = base.width / scaleHeight; // 
            imageHeight = base.height;
        }
    }

    
    const svg = Buffer.from(await satori(ErrorImage, {
        props: {
            title,
            description
        },
        width: imageWidth,
        height: imageHeight,
        fonts: [{
            name: 'Segoe UI',
            data: SegoeUI,
            weight: 400,
            style: 'normal',
        }]
    }));
    const resizer = sharp(svg);
    if (width < base.width || height < base.height) {
        resizer.resize({
            width: width,
            height: height,
            fit: "fill"
        });
    }
    return resizer.toFormat(format).toBuffer();
}

function getImageQuery(event: H3Event) {
    let query = getQuery(event);
    let width = typeof query.width == "string" ? parseInt(query.width) : 1200;
    let height = typeof query.height == "string" ? parseInt(query.height) : 600;
    let format = (typeof query.format == "string" && ["png", "jpeg"].includes(query.format)) ? query.format : "jpeg";
    if (isNaN(width)) {
        width = 1200;
    }
    if (isNaN(height)) {
        height = 600;
    }
    return {width, height, format: format as "jpeg"|"png"};
}

function sendImage(event: H3Event, image: Buffer, format: string, statusCode: number = 500) {
    setResponseStatus(event, statusCode);
    setHeader(event, 'Content-Type', `image/${format}`);
    setHeader(event, 'Cache-Control', "private,no-cache");
    setHeader(event, 'Content-Length', image.byteLength);
    return image;
}

export function useImagitorErrorHandle(eventHandler: EventHandler<EventHandlerRequest, EventHandlerResponse<Buffer|undefined>>) {
    return defineEventHandler(async (event) => {
        try {
            let response = eventHandler(event);
            if (response instanceof Promise) {
                return await response;
            } else {
                return response;
            }
        } catch (e) {
            const query = getImageQuery(event);
            
            let statusCode = 500;
            let title = "Aw, Snap!";
            let description = "Something went wrong while displaying this web page.";

            if (e instanceof NavigationError) {
                title = "This webpage is not available";
                description = e.errorCode;
            } else if (e instanceof H3Error) {
                statusCode = e.statusCode;
                if (e.statusCode == 404) {
                    title = "This page can not be found";
                    description = "HTTP_ERROR_404";
                } else {
                    description = e.message;
                }
            }

            const image = await generateErrorImage(title, description, query.width, query.height, query.format);

            return sendImage(event, image, query.format, statusCode);
        }
    });
}