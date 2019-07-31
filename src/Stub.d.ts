export interface Stub {
    request: {
        method: "GET" | "POST";
        url: string;
        body?: any;
    }

    response: {
        status: number;
        body?: any;
    }
}