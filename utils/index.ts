export function getCaptureURL(url: string, query?: Record<string, string>): string {
    const defaultQuery: Record<string, string> = {
        width: "1200",
        height: "600",
        maxAge: "86400",
        format: "jpeg",
        fullpage: "false",
        timeout: "10000",
        viewportWidth: "1200",
        viewportHeight: "600"
    };
    if (query !== undefined) {
        for(const key in defaultQuery){
            if(query[key] === defaultQuery[key]){
                delete query[key];
            }
        }
    }

    const params = (new URLSearchParams(Object.assign({ url }, query))).toString().replaceAll("%2F", "/").replaceAll("%3A", ":");
    const location = useRequestURL();
    const result = new URL((location.protocol || "http:") + "//" + location.host + "/capture?" + params);
    return result.toString();
}