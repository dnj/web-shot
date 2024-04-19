export function getCaptureURL(url: string, query?: Record<string, string>): string {
    const params = (new URLSearchParams(Object.assign({ url }, query))).toString().replaceAll("%2F", "/").replaceAll("%3A", ":");
    const location = useRequestURL();
    const result = new URL((location.protocol || "http:") + "//" + location.host + "/capture?" + params);
    return result.toString();
}