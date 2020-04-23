export interface Stub {
    request: {
        method: "GET" | "POST";
        url: string;
        headers?: any;
        body?: any;
    }

    response: {
        status: number;
        headers?: any;
        body?: any;
    }
}