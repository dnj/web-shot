export function getPublickEndPoint(endPoint: string): string {
    return import.meta.env.VITE_SERVER_URL + endPoint;
}